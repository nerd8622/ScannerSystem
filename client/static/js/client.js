const sendChat = (sock) => (e) => {
  e.preventDefault();
  const input = document.querySelector('#sid');
  const text = input.value;
  input.value = "";
  sock.emit(scantype, text);
};

const setType = (e) => {
	e.preventDefault();
	scantype = document.querySelector('#scantype').value;
	document.getElementById('pop1').style.display = 'none';
  document.addEventListener('click', () => {document.querySelector('#sid').focus()});
  document.querySelector('#tt').innerHTML += ` (Scan-${scantype})`;
  document.querySelector('#sid').focus();
};

(() => {
  const sock = io();
  var scantype;
  document.querySelector('#scan-form').addEventListener('submit', sendChat(sock));
  document.querySelector('#settype').addEventListener('submit', setType);
})();