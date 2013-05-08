(function () {
    "use strict";

    //Variables que representan el canvas y el contexto.
    var canvas, ctx;

    // Variables que representan los elementos en el fondo.
    var isla;
    var mar = { x: 0, y: 0, src: "Assets/mar.png", direction: 1 };
    var marDrawing;

    // Variable que representa los frames que han pasado.
    var frame = 0;
    
    // Variables que representan los elementos del gameplay.
    /*NOTA: Se intentó crear un objeto barco, del cual heredarían las variables barco 1 y barco 2, sin embargo, se complicó
        mucho la creación de dicho objeto, por lo que se decidió regresar a usar variables separadas para cada elemento de los barcos*/
    var barco1; // Barco amarillo
    var barco2; // Barco pirata

    var bala; // Variable que guarda el valor de la bala negra a disparar.
    var bala2; // Variable que guarda el valor de la segunda bala a disparar.

    var lifeBarco1 = new Array(); // Array que guarda la salud del barco Pirata.
    var lifeBarcoAmarillo = new Array(); // Array que guarda la salud del barco Amarillo.

    var balas = new Array(); //Array que guarda las balas que han sido disparadas por el jugador 2 para poder ser pintadas.
    var balasAzules = new Array(); //Array que contiene las balas disparadas por el jugador 1.

    // Variables que guardan los sonidos del video juego.
    var snd = new Audio("Assets/explosion.wav");
    var disparoSnd = new Audio("Assets/GunShot.wav");
    var defendSnd = new Audio("Assets/ExplosionMetal.wav");
    var looseSnd = new Audio("Assets/WaterSurfaceExplosion01.wav");

    //Variables que guardan el estado del barco
    var defending2 = false;
    var defending1 = false;
    var ready1 = false;
    var ready2 = false;

    var sprites1;
    var sprites2;


    //Función que se correrá al momento de que empiece el juego.
    function init() {
        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");

        preloadStuff();
       
       gameplay2();
        
    }

    // Método que se encarga de precargar los elementos para que puedan ser pintados en pantalla.
    function preloadStuff() {

        var toPreLoad = 0;//Esta variable nos sirve para contar cuantos elementos se van a cargar y cuantos hay por cargar

        // Método que nos permite preparar la imagen para que sea cargada, regresa la imagen que será cargada.
        var addImage = function (src) {
            var img = new Image();
            img.src = src;
            toPreLoad++;
            img.addEventListener('load', function () {
                toPreLoad--;
            }, false);
            return img;
        }

        /*Método que se encarga de revisar si ya se precargaron todos los elementos.*/
        var checkResources = function () {
            if (toPreLoad == 0)
                //Si ya no hay objetos por precargar, a dibujarlos.
                draw();
            else
                //Si hay objetos pendientes, esperar 200 con el setTimeout, y volver a intentar.
                setTimeout(checkResources, 200);
        }

        //Cargar las variables con los valores que van a ser preparados.
        sprites1 = { normal: addImage("Assets/barco21.png"), damaged:addImage("Assets/barco21Destruido.png")  };
        barco1 = sprites1.normal;

        sprites2 = {normal : addImage("Assets/barco1.png"), ready:addImage("Assets/barco1Disparando2.png"), damaged:addImage("Assets/barco1Destruido2.png")  };
        barco2 = sprites2.normal;

        isla = addImage("Assets/partearriba.png");
        bala = addImage("Assets/bala1.png");
        bala2 = addImage("Assets/bala2.png");
        marDrawing = addImage(mar.src);

       

        //Revisar que no haya elementos pendientes para cargar.
        checkResources();
    }

    /*Función que se manda llamar cuando los elementos están listos para ser dibujados, se encarga de dibujar los elementos.*/
    function draw() {
        frame += .1; //Aumenta el contador de frames.

        //Dibuja los elementos con sus respectivos métodos.
        drawDefaultObject(isla);
        drawDefaultObject(marDrawing);
        drawMar();
        drawObject(barco1, 0, 380);
        drawObject(barco2, 300, 0);
        drawBalasP1();
        drawBalasP2();

        //Método que se encarga de cargar los elementos cuando el GPU se encunetre preparado para redibujar.
        requestAnimationFrame(draw);
    }

    //Método default de pintado, pide el objeto y lo pinta en las coordenadas 0, 0.
    function drawDefaultObject(object) {
        ctx.drawImage(object, 0, 0);
    }

    //Método para pintar objeto en las cordenadas x y y.
    function drawObject(object, x, y) {
        ctx.drawImage(object, x, y);
    }

    //Método que se encarga de pintar y animar el mar.
    function drawMar() {
        //Se pinta el mar en la posición que le toca al mar.
        ctx.drawImage(marDrawing, mar.x, mar.y);
        //Se hace un switch con la variable dirección del mar.
        // En caso de ser positivo el mar va en dirección positiva del eje x.
        // En caso de ser negativo, el mar va en la dirección negativa del eje x.
        switch (mar.direction) {
            case 1:
                if (mar.x <= 32) {
                    mar.x += .1;
                } else mar.direction *= -1;
                break;
            case -1:
                if (mar.x >= -32) {
                    mar.x -= .1;
                } else mar.direction *= -1;
                break;
        }
    }

    // Método que dibuja las balas azules.
    function drawBalasP1() {
        //Recorrer el arreglo de las balas.
        for (var i = 0; i < balasAzules.length; i++) {
            //Se dibuja la bala en su posición.
            ctx.drawImage(bala2, balasAzules[i].x, balasAzules[i].y);
            //se revisa que la bala no esté en colisión 
            if (colissionDetectionItalianWay2(balasAzules[i]) == true) {
                //en caso de que si haya colisión
                //checar si el otro barco se está defendiendo
                if (defending2 == true) {
                    //No pasa nada.
                    defendSnd.play();
                    balasAzules.pop();
                } else {
                    //se guarda el daño realizado
                    lifeBarcoAmarillo.push(balasAzules.pop());
                    snd.play();
                }
                //se revisa si ya se hizo el suficiente daño.
                if (lifeBarcoAmarillo.length == 10) {
                    barco2 = sprites2.damaged;
                    looseSnd.play();
                    alert("Game Over! Player 1 wins!");
                    stopGameplay();
                }
            } else {
                //En caso de que no haya colisión, simplemente mover las balas.
                balasAzules[i].x += 18;
                balasAzules[i].y += -18;
            }
        }
    }

    //Método que se encarga de dibujar las balas disparadas por el jugador 2.
    function drawBalasP2() {
        //Se atraviesa el arreglo de las balas
        for (var i = 0; i < balas.length; i++) {
            //Se dibuja la bala en su posición.
            ctx.drawImage(bala, balas[i].x, balas[i].y);
            //Se revisa si ya colisionó con su objetivo
            if (colissionDetectionItalianWay(balas[i]) == true) {
                //si el otro barco se está defendiendo
                if (defending1 == true) {
                    //no hacer daño
                    defendSnd.play();
                    balas.pop();
                } else {
                    // En caso de que si esté defendiendo.
                    //Se incrementa el daño del barco de jugador 1.
                    lifeBarco1.push(balas.pop());
                    snd.play();
                }
                
                //Se revisa si ya se incrementó el daño lo suficiente como para la desutricción del barco.
                if (lifeBarco1.length == 10) {
                    //Animación de la explosión
                    barco1 = sprites1.damaged;
                    looseSnd.play();
                    alert("Game Over!, player 2 wins!");
                    stopGameplay();
                }
                
            } else {
                //De lo contrario, se incrementa la posición de las balas para que sigan avanzando.
                balas[i].y += 18;
                balas[i].x -= 18;
            }
        }
    }

    // Método que busca si las balas han colisionado con el barco.
    // Not working.
    function colissionDetection(objeto1, objeto2) {
        var p1 = { x: objeto1.x, y: objeto1.y };
        var p2 = { x: (objeto2.width / 2), y: (objeto2.height / 2) };

        var distancia = p1.x + bala.width/2;

        var pitagoras = function (x, y) {
            return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
        };

        var y = pitagoras(Math.abs(p1.x - p2.x), Math.abs(p1.y, p2.y));

        if (y <= distancia) {
            return true;
        } else return false;
    }

    //intento de collisiones v2
    //Medio funciona el método
    function colissionDetectionItalianWay(bullet) {
        if (Math.abs(bullet.y - 380) && Math.abs(bullet.x - 0) < 100) {
            return true;
        } else return false;
    }

    // Intento de colisiones v2 con las balas azules
    // Medio funciona el método
    function colissionDetectionItalianWay2(bullet) {
        if (Math.abs(bullet.y - 0)<100 && Math.abs(bullet.x - 300)) {
            return true;
        } else return false;
    }

    function stopGameplay() {
        document.body.onkeydown = null;
    }


    // Método con la lógica del juego.
    function gameplay2() {
       //Se espera a ver qué tecla presionó el usuario.
        document.body.onkeydown = function () {
            //Se guarda la tecla presionada en una variable temporal.
            var temp = event.keyCode;

            //Se revisa que tecla se presiono.
            switch (temp) {
                case 65:
                    //Se prepara el barco.
                    barco2 = sprites2.ready;
                    defending2 = false;
                    ready2 = true;
                    break;
                case 68:
                    //El barco se defiende.
                    defending2 = true;
                    alert("defense");
                    break;
                case 83:
                    defending2 = false;
                    // Si el barco no está preparado se prepara, si ya lo está, dispara.
                    if (ready2 == false) {
                        barco2 = sprites2.ready;
                        ready2 = true;
                        break;
                    } else {
                        balas.push({ x: 500, y: 200 });
                        disparoSnd.play();
                        ready2 = false;
                        barco2 = sprites2.normal;
                        break;
                    }
                //Misma lógica pero para el jugador 2.
                case 37:
                    //Se prepara el barco 1.
                    //No se tiene el sprite para esto por el momento xD
                    defending1 = false;
                    ready1 = true;
                    break;
                case 39:
                    //defend2
                    defending1 = true;
                    alert("defense!");
                    break;
                case 76:
                    //Dispara!
                    if (ready1 == false) {
                        ready1 = true;
                        break;
                    } else {
                        defending1 = false;
                        balasAzules.push({ x: 300, y: 500 });
                        disparoSnd.play();
                        ready1 = false;
                        break;
                    }
            } 
        };

        document.body.onmspointerdown = function (ev) {
            var pointerx = ev.clientX;
            var pointery = ev.clientY;
            //Si le picaron al barco amarillo
            if (pointerx > 0 && pointerx < 400 && pointery > 380) {
                if (ready1 == false) {
                    ready1 = true;
                } else {
                    defending1 = false;
                    balasAzules.push({ x: 300, y: 500 });
                    disparoSnd.play();
                    ready1 = false;
                }
            } else if (pointerx > 400 && pointery > 380) {
                defending1 = true;
                alert("defense");
            }

            if (pointerx > 400 && pointery < 300) {
                if (ready2 == false) {
                    barco2 = sprites2.ready;
                    ready2 = true;
                } else {
                    defending2 = false;
                    balas.push({ x: 500, y: 200 });
                    disparoSnd.play();
                    ready2 = false;
                    barco2 = sprites2.normal;
                }
            } else if (pointerx < 400 && pointery < 300) {
                defending2 = true;
                alert("defense");
            }
        };
    }
    window.addEventListener("DOMContentLoaded", init, false);
})();