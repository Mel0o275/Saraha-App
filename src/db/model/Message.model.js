import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    receiverId: {
        type: String,
        required: true
    },

    senderId: {
        type: String,
    },

    content: {
        type: String,
        minLenth: 1,
        maxLength: 1000000,
        required: function() {
            return !this.image?.length;
        }
    },

    image: {
        type: [String],
    },
})

export const MessageModel = mongoose.models.Message || mongoose.model("Message", messageSchema);