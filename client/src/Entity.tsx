// Define EventType as an interface
interface EventType {}

// Implement the CountryEvent class
class CountryEvent {
    day: number;
    eventType: EventType | undefined;

    constructor(data: any, country?: Country) {
        this.day = data.day;
        //Check the type of the event TraitementEvent or TransferResourceEvent
        if (data.event === "transferResource") {
            this.eventType = new TransferResourceEvent(data, country);
        }
        if (data.event === "sellEvent") {
            this.eventType = new MarketSellEvent(data);
        }
        if (data.event === "buyEvent") {
            this.eventType = new MarketBuyEvent(data);
        }
    }
}

class MarketSellEvent implements EventType{
    resource: string;
    amount: number;
    gain: number;
    to : string;

    constructor(data: any) {
        this.resource = data.resourceType;
        this.amount = data.amountExecuted;
        this.gain = data.gain;
        this.to = data.to;
    }
}

class MarketBuyEvent implements EventType{
    resource: string;
    amount: number;
    cost: number;
    from : string;

    constructor(data: any) {
        this.resource = data.resourceType;
        this.amount = data.amountExecuted;
        this.cost = data.cost;
        this.from = data.from;
    }
}



// Implement the TransferResourceEvent class
class TransferResourceEvent implements EventType{
    from: string;
    to: string;
    resource: string;
    amount: number;

    constructor(data: any, country?: Country) {
        this.from = data.from;
        this.to = data.to;
        this.resource = data.resource;
        this.amount = data.amount;
    }
}

class Resource {
    id: number;
    name: string;
    quantity: number;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.quantity = data.quantity;
    }
}

class Variation {
    resource: string;
    amount: number;

    constructor(data: any) {
        this.resource = data.resource;
        this.amount = data.amount;
    }

}



class Agent {
    id: string;
    name: string;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
    }
}

class Country {
    agent: Agent;
    color: string;
    money: number;
    history: CountryEvent[];
    moneyHistory: Map<string, number>;

    constructor(data: any) {
        this.agent = new Agent(data.agent);
        this.color = data.color;
        this.money = data.money;
        this.history = data.history.map((eventData: any) => new CountryEvent(eventData, this));
        this.moneyHistory = new Map<string, number>(Object.entries(data.moneyHistory));
    }
}

class Territory {
    x: number;
    y: number;
    name: string;
    variations: Variation[];
    stock: Map<string, number>;
    stockHistory: Map<number, Map<string, number>>;
    habitants: number;
    habitantsHistory: Map<string, number>;
    country: Country | undefined;

    constructor(data: any) {
        this.x = data.x;
        this.y = data.y;
        this.name = data.name;
        this.variations = data.variations.map((variationData: any) => new Variation(variationData));
        this.stock = new Map<string, number>(Object.entries(data.stock));
        this.habitants = data.habitants;
        this.country = new Country(data.country);
        this.stockHistory = new Map<number, Map<string, number>>();
        for (const key in data.stockHistory) {
            const innerMap = new Map<string, number>(Object.entries(data.stockHistory[key]));
            this.stockHistory.set(Number(key), innerMap);
        }
        this.habitantsHistory = new Map<string, number>(Object.entries(data.habitantsHistory));
    }
}

class MarketInteraction {
    dateTransaction: string;
    resourceType: string;
    amount: number;
    price: number;
    buyer: string ;
    seller: string;

    constructor(data: any) {
        this.dateTransaction = data.dateTransaction;
        this.resourceType = data.resourceType;
        this.amount = data.amount;
        this.price = data.price;
        this.buyer = data.buyer.agent.name;
        this.seller = data.seller.agent.name;
    }
}

class Market {
    history: MarketInteraction[];
    prices: Map<string, number>;

    constructor(data: any) {
        this.history = data.history.map((interactionData: any) => new MarketInteraction(interactionData));
        this.prices = new Map<string, number>(Object.entries(data.prices));
    }
}

class Environment {
    market : Market;
    consumptionByHabitant: Map<string, number>;

    constructor(data: any) {
        this.market = new Market(data.market);
        this.consumptionByHabitant = new Map<string, number>(Object.entries(data.consumptionByHabitant))
    }
}


class Simulation {
    secondByDay: number;
    environment: Environment;
    territories: Territory[];
    countries: Map<string, Country>;
    currentDay: number;

    constructor(data: any) {
        this.secondByDay = data.secondByDay;
        this.environment = new Environment(data.environment);
        this.territories = data.territories.map((territoryData: any) => new Territory(territoryData));
        this.countries = new Map<string, Country>(
            Object.entries(data.countries).map(([countryKey, countryData]: [string, any]) => [
                countryKey,
                new Country(countryData),
            ])
        );
        this.currentDay = data.currentDay;
    }
}

export { Simulation, Territory, Country, Resource, Variation, Agent, MarketInteraction, Market, Environment };
