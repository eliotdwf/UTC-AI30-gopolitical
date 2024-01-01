import {Button, Col, Modal, Row} from "react-bootstrap";
import Image from "react-bootstrap/Image";
import React, {useEffect, useState} from "react";
import {CountryFlagService} from "../services/CountryFlagService";
import {Country, Simulation} from "../Entity";
import StockHistoryChart from "./stockHistoryChartComponent/stockHistoryChartComponent";

interface CountryStockEvolutionProps {
    onHide: () => void;
    propsCountry: Country | null;
    simulation: Simulation;
    show: boolean;
}

function CountryStockEvolutionComponent({ onHide, propsCountry, simulation, show }: CountryStockEvolutionProps) {
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [country, setCountry] = useState<Country | null>(propsCountry)
    const [countryPopulation, setCountryPopulation] = useState(country?.getCountryPopulation(simulation));

    useEffect(() => {
        if (propsCountry != null) {
            let simCountry = simulation.countries.get(propsCountry.agent.id);
            if (simCountry != undefined) {
                setCountry(simCountry);
                setCountryPopulation(country?.getCountryPopulation(simulation))
            }
        }
    }, [simulation])

    // Fonction pour obtenir le flag du country
    const countryFlagService = new CountryFlagService();
    const getCountryFlagById = (countryId: string | undefined): string => {
        return countryFlagService.getCountryFlagById(countryId);
    };

    const stockHistory = country?.getAllTerritoriesStockHistory(simulation);
    return (
        <Modal
        show={show}
        onHide={onHide}
        centered
        scrollable={true}
        size="lg"
    >
        <Modal.Header className="bg-dark text-light">
            <div className="d-flex justify-content-between align-items-center col-12">
                <div className="col-10">
                    <h3 className="card-title mb-1">{country?.agent.name}</h3>
                    <h4 className={"text-warning"}>Evolution des stocks</h4>
                </div>
                <div className="col-2">
                    <Image src={getCountryFlagById(country?.agent.id)} alt={country?.agent.name + " flag"} fluid />
                </div>
            </div>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
            <Row className="justify-content-center">
                <Col className="col-10">
                    {stockHistory && <StockHistoryChart stockHistory={stockHistory}/>}
                </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-light">
                <Button variant="outline-warning" className="col-auto" onClick={onHide}>Retour</Button>
        </Modal.Footer>
    </Modal>
);
}
export default CountryStockEvolutionComponent;