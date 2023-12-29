package gopolitical

import (
	"fmt"
	"log"
	"sync"
	"time"
)

type Simulation struct {
	SecondByDay float64             `json:"secondByDay"`
	Environment Environment         `json:"environment"`
	Territories []*Territory        `json:"territories"`
	Countries   map[string]*Country `json:"countries"`
	CurrentDay  int                 `json:"currentDay"`
	wg          *sync.WaitGroup
	WebSocket   *WebSocket `json:"-"`
}

const (
	WATER_BY_HABITANT = 0.5
	FOOD_BY_HABITANT  = 0.5
)

func NewSimulation(
	secondByDay float64,
	prices Prices,
	countries map[string]*Country,
	territories []*Territory,
	wg *sync.WaitGroup,
) Simulation {
	return Simulation{secondByDay, NewEnvironment(countries, territories, prices, wg), territories, countries, 0, wg, nil}
}

func (s *Simulation) Start() {
	//Launch all agents and added a channel to the environment

	s.WebSocket = NewWebSocket(s)
	go s.WebSocket.Start()

	log.Println("Start of the simulation : ")
	log.Println("Number of countries : ", len(s.Countries))
	log.Println("Number of territories : ", len(s.Territories))

	for _, country := range s.Countries {
		log.Println("Nombre de territoires dans  : ", country.Name, " : ", len(country.Territories))
	}

	go s.Environment.Start()

	for _, country := range s.Countries {
		go country.Start()
	}

	for {
		s.CurrentDay++
		log.Println("Day : ", s.CurrentDay)

		//Wait for all agents to finish their actions
		s.wg.Wait()

		//On fait correspondre les ordres d'achats et de ventes
		s.Environment.Market.HandleRequests()

		//Mettre à jour les stocks des territoires à partir des variations
		s.Environment.UpdateStocksFromVariation()

		//Mettre à jour les stocks des territoires à partir des consommations des habitants
		s.Environment.UpdateStocksFromConsumption()

		log.Println("End of the day : ", s.CurrentDay)
		fmt.Print("\n\n\n")

		//Wait the other day
		time.Sleep(time.Duration(s.SecondByDay) * time.Second)
		//Udd history
		s.Environment.UpdateStockHistory(s.CurrentDay)
		s.Environment.UpdateMoneyHistory(s.CurrentDay)
		s.Environment.UpdateHabitantsHistory(s.CurrentDay)

		//Send update to the websocket
		s.WebSocket.SendUpdate()
		//Unlock all agents
		for _, country := range s.Countries {
			country.In <- true
		}
	}
}
