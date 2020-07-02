package main

import (
	"math/rand"
	"time"
)

func main() {
	for i := 1; i <= 20; i++ {
		chooseWord()

		// Go est trop rapide, le random est souvent le même
		// On met en pause l'execution du code pour
		time.Sleep(2)
	}
}

func chooseWord() {
	rand.Seed(time.Now().UnixNano())

	var strArray [20]string
	strArray[0] = "super-glue"
	strArray[1] = "velo"
	strArray[2] = "voiture"
	strArray[3] = "chaussure"
	strArray[4] = "disjoncteur"
	strArray[5] = "eglise"
	strArray[6] = "machine a laver"
	strArray[7] = "aspirateur"
	strArray[8] = "ecrevisse"
	strArray[9] = "koala"
	strArray[10] = "montre a gousset"
	strArray[11] = "jagermeister"
	strArray[12] = "trepied"
	strArray[13] = "mirroir"
	strArray[14] = "starbucks"
	strArray[15] = "costume"
	strArray[16] = "ange"
	strArray[17] = "espace"
	strArray[18] = "eclipse"
	strArray[19] = "ceinture"

	index := rand.Intn(20)
	println(strArray[index])
}
