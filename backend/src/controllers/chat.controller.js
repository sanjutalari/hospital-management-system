import { prisma } from '../config/database.js';

// Get conversation history between current user and another user
export const getConversation = async (req, res) => {
  const myId    = req.user.id;
  const otherId = req.params.userId;
  const limit   = parseInt(req.query.limit) || 50;
  const cursor  = req.query.cursor;

  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: myId,    receiverId: otherId },
        { senderId: otherId, receiverId: myId   },
      ],
    },
    orderBy: { sentAt: 'desc' },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  // Mark received messages as read
  await prisma.chatMessage.updateMany({
    where: { senderId: otherId, receiverId: myId, isRead: false },
    data: { isRead: true },
  });

  res.json(messages.reverse());
};

// Get list of conversations (unique chat partners)
export const getConversationList = async (req, res) => {
  const myId = req.user.id;

  const messages = await prisma.chatMessage.findMany({
    where: { OR: [{ senderId: myId }, { receiverId: myId }] },
    orderBy: { sentAt: 'desc' },
    include: {
      sender:   { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
  });

  const seen = new Map();
  for (const msg of messages) {
    const partner = msg.senderId === myId ? msg.receiver : msg.sender;
    if (!seen.has(partner.id)) {
      seen.set(partner.id, {
        partner,
        lastMessage: msg.content,
        lastAt: msg.sentAt,
        unread: 0,
      });
    }
    if (msg.receiverId === myId && !msg.isRead) {
      seen.get(partner.id).unread++;
    }
  }

  res.json(Array.from(seen.values()));
};