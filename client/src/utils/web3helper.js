export const toEther = (web3, number) => {
    return web3.utils.fromWei(number.toString(), 'ether') + ' ETH';
}

export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';