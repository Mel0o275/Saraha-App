import { MessageModel } from "../../db/model/Message.model.js"
import { UserModel } from "../../db/model/User.Model.js";


export const sendMessage = async (reciverId, files, input, user) => {
    const reciver = await UserModel.findById(reciverId);
    if (!reciver) {
        throw new Error("Reciver not found");
    }
    console.log(user);

    const message = await MessageModel.create({
        receiverId: reciverId,
        content: input.content,
        image: files ? files.map(file => file.path) : [],
        senderId: user?._id || undefined
    });
    return;
}

export const getAllMessage = async (user) => {

    const message = await MessageModel.find({
        $or: [
            { receiverId: user._id },
            { senderId: user._id }
        ]
    })

    console.log("message:", message);

    return message;
};

export const getMessageById = async (messageId) => {
    const message = await MessageModel.findById(messageId);

    if (!message) {
        throw new Error("Message not found");
    }

    return message;
}

export const deleteMessage = async (messageId, user) => {
    const message = await MessageModel.findById(messageId);

    if (!message) {
        throw new Error("Message not found");
    }

    if (message.receiverId.toString() !== user._id.toString()) {
        throw new Error("Unauthorized");
    }

    await MessageModel.findByIdAndDelete(messageId);
    return;
    
}

