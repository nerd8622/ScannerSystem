const play = () => {
  document.querySelector(".checkmark").classList = "checkmark";
  document.querySelector(".checkmark_check").className = "checkmark_check";
  document.querySelector(".checkmark_circle").className = "checkmark_circle";

  setTimeout(() => {
    document.querySelector(".checkmark").className.baseVal = "checkmark checkmark_anim";
    document.querySelector(".checkmark_check").className.baseVal = "checkmark_check checkmark_check_anim";
    document.querySelector(".checkmark_circle").className.baseVal = "checkmark_circle checkmark_circle_anim";
  }, 1)
}

const sendChat = (sock) => (e) => {
  e.preventDefault();
  const input = document.querySelector('#sid');
  const text = input.value;
  input.value = "";
  sock.emit(scantype, text);
  play();
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