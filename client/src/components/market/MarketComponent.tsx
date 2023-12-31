import React, { useState } from "react";
import { Row, Col, Image, Table, Pagination } from "react-bootstrap";
import { Simulation } from "../../Entity";
import { ResourceIconService } from "../../services/ResourceIconService";
import { CountryFlagService } from "../../services/CountryFlagService";
import './MarketComponent.css';
import {CountryService} from "../../services/CountryService";

interface MarketComponentProps {
    simulation: Simulation | undefined;
}

const MarketComponent: React.FC<MarketComponentProps> = ({ simulation }) => {
    const [currentPage, setCurrentPage] = useState(1);

    if (!simulation || !simulation.environment || !simulation.environment.market) {
        return <div>Loading...</div>;
    }

    const marketData = simulation.environment.market;
    const marketPrices = marketData.prices;
    const marketHistory = marketData.history;

    const countryFlagService = new CountryFlagService();
    const countryService = new CountryService(simulation.countries);
    const resourceIconService = new ResourceIconService();

    const itemsPerPage = 12;

    const sortedMarketHistory = marketHistory
        .slice()
        .sort((a, b) => {
            const dateA = new Date(a.dateTransaction).getTime();
            const dateB = new Date(b.dateTransaction).getTime();
            return dateB - dateA;
        });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedMarketHistory.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const marketPricesElements = (
        <Table striped bordered hover>
            <tbody>
            <tr>
                {Array.from(marketPrices.entries()).map(([resource, price], index) => (
                    <td key={`price-${index}`} className="">
                        <div className="flex-lg-column m-lg-2 text-center">
                            <img
                                src={resourceIconService.getResourceIconPath(resource)}
                                alt={`${resource} icon`}
                                className="img-fluid resource-icon"
                            />
                            <span className="ms-2"> {price}$/Unit</span>
                        </div>
                    </td>
                ))}
            </tr>
            </tbody>
        </Table>
    );

    const marketTransactions = (
        <Col md={9} className="market-column market-transactions">
            <h2 className="text-center mb-3">Market Transactions</h2>
            <Table striped bordered hover className="table-market-transactions">
                <thead>
                <tr className="text-center">
                    <th>Day</th>
                    <th>Resource</th>
                    <th>Amount</th>
                    <th>Price</th>
                    <th>Cost</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.map((interaction, index) => (
                    <tr key={index}>
                        <td className="text-center">{interaction.dateTransaction}</td>
                        <td className="text-center">
                            <img
                                src={resourceIconService.getResourceIconPath(interaction.resourceType)}
                                alt={`${interaction.resourceType} icon`}
                                className="resource-icon-with-margin"
                            />
                            {interaction.resourceType}
                        </td>
                        <td className="text-center">{interaction.amount}</td>
                        <td className="text-center">{interaction.price}$/Unit</td>
                        <td className="text-center">{interaction.price * interaction.amount}$</td>
                        <td>
                            <Image
                                src={countryFlagService.getCountryFlagById(countryService.getId(interaction.buyer))}
                                alt={`${interaction.buyer} flag`}
                                fluid
                                className="flag-icon-market resource-icon-with-margin-flag"
                            />
                            {interaction.buyer}
                        </td>
                        <td>
                            <Image
                                src={countryFlagService.getCountryFlagById(countryService.getId(interaction.seller))}
                                alt={`${interaction.seller} flag`}
                                fluid
                                className="flag-icon-market resource-icon-with-margin-flag"
                            />
                            {interaction.seller}
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <div className="d-flex justify-content-center">
                <Pagination>
                    {Array.from({ length: Math.ceil(sortedMarketHistory.length / itemsPerPage) }).map((_, index) => (
                        <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </div>
        </Col>
    );

    return (
        <Row className="market-display">
            {marketPricesElements}
            {marketTransactions}
        </Row>
    );
};

export default MarketComponent;
