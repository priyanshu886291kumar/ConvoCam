import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  messages: [],
  isMessagesLoading: false,
  selectedUser: null,

  setSelectedUser: (user) => set({ selectedUser: user, messages: [] }),

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages`, {
        params: { userId, otherUserId: get().selectedUser?._id, limit: 20 },
      });
      set({ messages: Array.isArray(res.data) ? res.data : [] });
    } catch {
      set({ messages: [] });
    }
    set({ isMessagesLoading: false });
  },

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}));