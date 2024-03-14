// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DigitalRupee is ERC20, ERC20Burnable, Pausable, AccessControl {
    address public owner;
    address public authority;
    mapping(address => bool) public authorizedAddresses;
    mapping(address => uint256) public frozenBalanceOf;
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ACCESS_ROLE = keccak256("ACCESS_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    event onAccountEnable(address indexed account);
    event onAccountDisable(address indexed account);
    event onAuthorityChange(address indexed newAuthority);
    event onFrozenBalanceUpdate(address indexed wallet, uint256 amount);

    constructor(
        address _authority,
        address _owner
    ) ERC20("Digital Rupee", "EINR") {
        owner = _owner;
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);

        authority = _authority;
        _grantRole(BURNER_ROLE, _authority);
        _grantRole(MINTER_ROLE, _authority);
        _grantRole(PAUSER_ROLE, _authority);
        _grantRole(ACCESS_ROLE, _authority);
        _grantRole(FREEZER_ROLE, _authority);
    }

    function decimals() public view virtual override returns (uint8) {
        return 2;
    }

    modifier checkAccess(address from, address to) {
        require(
            from != address(0) || to != address(0),
            "From and to account address cannot be zero"
        );
        require(
            from == address(0) ||
                to == address(0) ||
                (authorizedAddresses[from] && authorizedAddresses[to]),
            "From and to accounts must be authorized"
        );
        _;
    }

    modifier checkFrozenBalance(address from, uint256 amount) {
        require(
            from == address(0) ||
                balanceOf(from) - frozenBalanceOf[from] >= amount,
            "Insufficient liquid balance"
        );
        _;
    }

    function updateAuthority(address newAuthority) public {
        require(msg.sender == owner, "Only owner can update authority");
        authority = newAuthority;
        emit onAuthorityChange(newAuthority);
    }

    function disableAccount(address account) public onlyRole(ACCESS_ROLE) {
        require(authorizedAddresses[account], "Account is already disabled");
        authorizedAddresses[account] = false;
        emit onAccountDisable(account);
    }

    function enableAccount(address payable account) public payable onlyRole(ACCESS_ROLE) {
        require(!authorizedAddresses[account], "Account is already enabled");
        (bool sent,) = account.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        authorizedAddresses[account] = true;
        emit onAccountEnable(account);
    }

    function verifyAccount(address account) public view virtual returns (bool) {
        return authorizedAddresses[account];
    }

    function increaseFrozenBalance(
        address from,
        uint256 amount
    ) external whenNotPaused onlyRole(FREEZER_ROLE) {
        frozenBalanceOf[from] += amount;
        emit onFrozenBalanceUpdate(from, frozenBalanceOf[from]);
    }

    function decreaseFrozenBalance(
        address from,
        uint256 amount
    ) external whenNotPaused onlyRole(FREEZER_ROLE) {
        require(frozenBalanceOf[from] >= amount, "Insufficient frozen balance");
        frozenBalanceOf[from] -= amount;
        emit onFrozenBalanceUpdate(from, frozenBalanceOf[from]);
    }

    function transfer(
        address to,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }

    function mint(
        address to,
        uint256 amount
    ) external whenNotPaused onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(
        uint256 amount
    ) public override whenNotPaused onlyRole(BURNER_ROLE) {
        super.burn(amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override checkFrozenBalance(from, amount) checkAccess(from, to) {
        super._beforeTokenTransfer(from, to, amount);
    }
}