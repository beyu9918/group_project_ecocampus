const socket = io();
const { currentUserId, receiverId, productId } = window.chatContext;

socket.emit('joinRoom', currentUserId);

const input = document.getElementById('messageInput');
const button = document.getElementById('sendBtn');
const box = document.getElementById('messages');

button.addEventListener('click', () => {
  const content = input.value.trim();
  if (!content) return;

  socket.emit('sendMessage', {
    senderID: currentUserId,
    receiverID: receiverId,
    productID: productId,
    content
  });

  append('You', content);
  input.value = '';
});

socket.on('newMessage', (data) => {
  append('Them', data.content);
});

function append(who, text) {
  const msg = document.createElement('div');
  msg.textContent = `${who}: ${text}`;
  box.appendChild(msg);
}
