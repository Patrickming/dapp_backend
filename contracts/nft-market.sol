// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

error NotListed(uint256 tokenId);
error PriceMustBeAboveZero();
error YouNotOwner();

contract Market is IERC721Receiver {
    // State Variables
    IERC20 public erc20;
    IERC721 public erc721;

    bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;

    struct Order {
        address seller;
        uint256 tokenId;
        uint256 price;
    }

    mapping(uint256 => Order) public orderOfId; // token id to order
    Order[] public orders;
    mapping(uint256 => uint256) public idToOrderIndex;

    modifier isListed(uint256 _tokenId) {
        if (orderOfId[_tokenId].seller == address(0)) {
            revert NotListed(_tokenId);
        }
        _;
    }

    //record listingItem
    event Deal(address buyer, address seller, uint256 tokenId, uint256 price);
    event NewOrder(address seller, uint256 tokenId, uint256 price);
    event CancelOrder(address seller, uint256 tokenId);
    event ChangePrice(
        address seller,
        uint256 tokenId,
        uint256 previousPrice,
        uint256 price
    );

    constructor(IERC20 _erc20, IERC721 _erc721) {
        require(
            address(_erc20) != address(0),
            "Market: ERC20 contract address must be non-null"
        );
        require(
            address(_erc721) != address(0),
            "Market: ERC721 contract address must be non-null"
        );
        erc20 = IERC20(_erc20);
        erc721 = IERC721(_erc721);
    }

    //function to buy an item
    function buy(uint256 _tokenId) external isListed(_tokenId) {
        address seller = orderOfId[_tokenId].seller;
        address buyer = msg.sender;
        uint256 price = orderOfId[_tokenId].price;

        require(
            erc20.transferFrom(buyer, seller, price),
            "Market: ERC20 transfer not successfull"
        );
        erc721.safeTransferFrom(address(this), buyer, _tokenId);

        removeListing(_tokenId);
        emit Deal(buyer, seller, _tokenId, price);
    }

    function cancelOrder(uint256 _tokenId) external isListed(_tokenId) {
        address seller = orderOfId[_tokenId].seller;
        if (seller != msg.sender) {
            revert YouNotOwner();
        }

        erc721.safeTransferFrom(address(this), seller, _tokenId);

        removeListing(_tokenId);
        emit CancelOrder(seller, _tokenId);
    }

    //function to update the nft price
    function changePrice(
        uint256 _tokenId,
        uint256 _price
    ) external isListed(_tokenId) {
        address seller = orderOfId[_tokenId].seller;

        if (seller != msg.sender) {
            revert YouNotOwner();
        }

        uint256 previousPrice = orderOfId[_tokenId].price;
        orderOfId[_tokenId].price = _price;
        Order storage order = orders[idToOrderIndex[_tokenId]];
        order.price = _price;

        emit ChangePrice(seller, _tokenId, previousPrice, _price);
    }

    function removeListing(uint256 _tokenId) internal {
        delete orderOfId[_tokenId];

        uint256 orderToRemoveIndex = idToOrderIndex[_tokenId];
        uint256 lastOrderIndex = orders.length - 1;

        if (lastOrderIndex != orderToRemoveIndex) {
            Order memory lastOrder = orders[lastOrderIndex];
            orders[orderToRemoveIndex] = lastOrder;
            idToOrderIndex[lastOrder.tokenId] = orderToRemoveIndex;
        }

        orders.pop();
    }

    //function to list an nft
    function _placeOrder(
        address _seller,
        uint256 _tokenId,
        uint256 _price
    ) internal {
        if (_price <= 0) {
            revert PriceMustBeAboveZero();
        }

        orderOfId[_tokenId].seller = _seller;
        orderOfId[_tokenId].price = _price;
        orderOfId[_tokenId].tokenId = _tokenId;

        orders.push(orderOfId[_tokenId]);
        idToOrderIndex[_tokenId] = orders.length - 1;
        emit NewOrder(_seller, _tokenId, _price);
    }

    //在safeTransferFrom（ERC721），_safeMint（ERC721），_safeTransfer中会调用间接onERC721Received
    //也就是说，nft合约，在mint或者safeTransferFrom（带data（_price））时的时候 间接就上架了
    //然后在本合约中只有在721代币合约中调用带data的safeTransferFrom才会触发onERC721Received
    function onERC721Received(
        address _operator,
        address _seller,
        uint256 _tokenId,
        bytes calldata _data
    ) public override returns (bytes4) {
        require(_operator == _seller, "Market: Seller must be operator");
        uint256 _price = toUint256(_data, 0);

        _placeOrder(_seller, _tokenId, _price);

        return MAGIC_ON_ERC721_RECEIVED;
    }

    function toUint256(
        bytes memory _bytes,
        uint256 _start
    ) public pure returns (uint256) {
        require(_start + 32 >= _start, "Market: toUint256_overflow");
        require(_bytes.length >= _start + 32, "Market: toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }

    //---------------Utility functions-----------------

    function getOrderLength() public view returns (uint256) {
        return orders.length;
    }

    function isList(uint256 _tokenId) public view returns (bool) {
        return orderOfId[_tokenId].seller != address(0);
    }

    function getOrder() external view returns (Order[] memory) {
        return orders;
    }

    function getMyOrder() public view returns (Order[] memory) {
        Order[] memory myOrders = new Order[](getOrderLength());
        uint256 count = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].seller == msg.sender) {
                myOrders[count] = orders[i];
                count++;
            }
        }
        return myOrders;
    }
}
