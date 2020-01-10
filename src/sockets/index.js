import {
    postSwap,
    postWithdraw,
    postPrice,
    updateUserPhone,
    updateUserAddress,
    postDeposit
} from "./notiSocket";
/**
 * @param io from socket.io libs
 */

let initSockets = (io) => {
    
    postWithdraw(io);
    postSwap(io);
    postPrice(io);
    updateUserPhone(io);
    updateUserAddress(io);
    postDeposit(io);
};

module.exports = initSockets;