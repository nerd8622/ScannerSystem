const add = (data) => {
  let row = table.getElementsByTagName('tbody')[0].insertRow(-1);
  let r1 = row.insertCell(0), r2 = row.insertCell(1), 
  r3 = row.insertCell(2), r4 = row.insertCell(3);
  r1.innerHTML = data[0], r2.innerHTML = data[1],
  r3.innerHTML = data[2], r4.innerHTML = data[3];
}

const sub = (id) => {
  for ( var i = 0; i < table.rows.length; i++ ) {
    var tr = table.rows[i];
    var cll = tr.cells[1];                                                              
    if(cll.innerText == id) {
        tr.remove();
        break;
    }
  }
}

const animate = () => {

}

(() => {
  const sock = io();
  const table = document.querySelector('#table');

  sock.on('init', (people) => {
	for (let p of people){add(p);}
  });
  sock.on('in', (p) => {
    for(let i = 0; i<50; i++){
    add(p);}
  });
  sock.on('out', (id) => {
    sub(id);
  });
})();