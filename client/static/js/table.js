const columnSort = (table, column, ascending=true) => {
    let tableBody = table.getElementsByTagName('tbody')[0];
    let rowList = Array.from(tableBody.querySelectorAll("tr"));
    rowList.sort((r1, r2) => {
        if (ascending){return r1.cells[column].innerText < r2.cells[column].innerText;
        }else{console.log(r1.cells[column].innerText); return r1.cells[column].innerText > r2.cells[column].innerText;}
    });
    while(tableBody.firstChild) {tableBody.removeChild(tableBody.firstChild);}
    tableBody.append(...rowList);
};

const search = (table, query, column=null) => {
    for ( let i = 0; i < table.rows.length; i++ ) {
        let tr = table.rows[i];
        if (column){
            let cll = tr.cells[1];                                                              
            if(cll.innerText.includes(query)) {
                break;
            }
        }
        else {
            for (let i = 0; j < tr.cells.length; j++) {
                let cl1 = tr.cells[j];
                if(cll.innerText.includes(query)) {
                    break;
                }
            }
        }
      }
};