const socket = io();       //jaise hamne backend pe socket set up kiya tha wese hi hame frontend pe bhi krna padta hai .. or jab ham ye line likhte hain toh jo bhi banda website pe aata hai vo socket se connect ho jaata hai toh frontend or backend connect ho jaate hai 

const chess = new Chess();

const boardElement= document.querySelector(".chessboard");

let draggedPeice= null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = ()=>{
    const board= chess.board();            //ek chess board render ho jaega
    boardElement.innerHTML ="";           // glti se chessboard me kuch default ulta pulta hai toh clear hoke initial state pe aa jaega 
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
             const squareElement= document.createElement("div");      //dynamic div create ho jaega 
             squareElement.classList.add("square",                    //squareElement naam ka jo abhi hamne dynamic div create kiya hai humne uspe do classes add kari hai ek sqaure or ek light/dark
                (rowindex + squareindex)%2 ===0 ?"light":"dark"
             );

             squareElement.dataset.row= rowindex;
             squareElement.dataset.col= squareindex;

             if(square){
                const peiceElement = document.createElement("div");
                peiceElement.classList.add("peice", square.color ==="w"? "white" :"black"
                );

                peiceElement.innerText=getPeiceUnicode(square);
                peiceElement.draggable=true;


                peiceElement.addEventListener("dragstart" ,(e)=>{
                    if(peiceElement.draggable){
                        draggedPeice= peiceElement;
                        sourceSquare= {row:rowindex , col:squareindex} ;
                        e.dataTransfer.setData("text/plain","");
                    }
                });

                peiceElement.addEventListener("dragend" , ()=>{
                    draggedPeice= null;
                    sourceSquare= null;
                })

                squareElement.appendChild(peiceElement);
             }

             squareElement.addEventListener("dragover",function(e){
                e.preventDefault();
             })

             squareElement.addEventListener("drop",function(e){
                e.preventDefault();
                if(draggedPeice){
                    const targetSource = {
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare , targetSource);
                }
             })
             boardElement.appendChild(squareElement);
        })
        
    });

    if(playerRole==="b"){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped"); 
    }
   
};




const handleMove= (source,target)=>{
     const move ={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:"q",
     }
     
    console.log("Sending move:", move);
     socket.emit("move", move);
};


const getPeiceUnicode=(peice)=>{
    const unicodePeices={
        k: '♔',
        q: '♕',
        r: '♖', 
        b: '♗', 
        n: '♘', 
        p: '♙',
        K: '♚',
        Q: '♛', 
        R: '♜', 
        B: '♝', 
        N: '♞', 
        P: '♟',
    };

    return unicodePeices[peice.type] || "";    //jo peice recieve hua hai usko unicodePeices wale function me match karo agar peice mil jaata hai toh peice,type me uski value aa jaegi ni toh null string return ho jaegi 
};

socket.on("playerRole", function(role){
    playerRole= role;
    console.log("Player role assigned:", role);
    renderBoard();
})

socket.on("spectatorRole", function(){
    playerRole= null;
    renderBoard();
})

socket.on("boardState", function(fen){
    chess.load(fen);
    console.log("Board state received:", fen);
    renderBoard();
})


socket.on("move", function(move){
    chess.move(move);
    renderBoard();
})

renderBoard();