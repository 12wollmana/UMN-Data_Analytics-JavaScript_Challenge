/**
 * The data to use.
 * From data.js.
 */
const tableData = data;

/**
 * Elements in the DOM.
 */
const elements = 
{
    dateOption: d3.select("#datetime"),
    ufoTableBody: d3.select("#ufo-table>tbody")
};

/**
 * This represents the data model of the table.
 */
class SightingsTableModel {
    /**
     * Data model for the UFO Sightings Table.
     * @param {any[]} data The data to use for the table.
     */
    constructor(data){
        this.data = data;
    }

    /**
     * Gets all the data within the table.
     */
    getAllData = () => {
        return data;
    }

    /**
     * Filters a set of data on datetime.
     * @param {string} datetime 
     * The datetime to filter on.
     * @param {any[]} data 
     * The data to filter on. 
     * By default, all data in the model.
     */
    getDataByDatetime = (datetime, data = this.data) => {
        return data.filter((sighting => sighting.datetime === datetime));
    }

    /**
     * Returns all unique dates within the data.
     * @param {any[]} data 
     * The data to get the datetimes from. 
     * By default, all data in the model.
     */
    getAllDatetimes = (data = this.data) => {
        const dates = data.map((sighting => sighting.datetime))
        // Unique dates only
        // From https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
        return [...new Set(dates)]; 
    }
}

/**
 * This represents the table within the view.
 * Handles rendering of the table.
 */
class SightingsTableView {
    constructor(){}

    /**
     * Renders a table within the view.
     * @param {any[]} tableData 
     * The data to show in the view.
     */
    renderTable = (tableData) => {
        this.clearTable();
        tableData.forEach(this.renderRow);
    };
    
    /**
     * Render a row within the view.
     * @param {any} rowData 
     * The data in the row to render.
     */
    renderRow = (rowData) => {
        const table = elements.ufoTableBody;
        const row = table.append("tr");
    
        const date = rowData.datetime;
        const city = rowData.city;
        const state = rowData.state;
        const country = rowData.country;
        const shape = rowData.shape;
        const duration = rowData.durationMinutes;
        const comments = rowData.comments;
    
        const rowOrganizedData = [
            date,
            city,
            state,
            country,
            shape,
            duration,
            comments
        ];
    
        rowOrganizedData.forEach(dataValue => {
            let cell = row.append("td");
            cell.text(dataValue)
        });
    }; 
    
    /**
     * Clears the table in the view.
     */
    clearTable = () => {
        const table = elements.ufoTableBody;
        table.html("")
    }
}

/**
 * This represents the filter controls in the view.
 * Handles rendering and retrieving options.
 */
class FilterView 
{
    constructor() {}

    /**
     * The default option to show.
     * Should represent showing all data.
     */
    defaultDateOption = "All";

    /**
     * Renders options in the date selection control.
     * @param {string} dates 
     * The dates to render as options.
     */
    renderDateOptions = (dates) => {
        this.clearDateOptions();
        dates.forEach(this.renderDateOption);
    }

    /**
     * Renders an option within the date selection control.
     * @param {string} optionText 
     * The text to render as an option.
     */
    renderDateOption = (optionText) => {
        const options = elements.dateOption;
        const option = options.append("option");
        option.text(optionText);
    }

    /**
     * Clears all options from the date selection control 
     * except the default option.
     */
    clearDateOptions = () => {
        const options = elements.dateOption;
        options.html("");
        this.renderDateOption(this.defaultDateOption);
    }

    /**
     * Gets the current selection in the date selection control.
     */
    getSelectedDateOption = () => {
        return elements.dateOption.property("value");
    }
}

/**
 * Handles the main logic.
 */
class MainController
{
    constructor(tableModel, tableView, filterView)
    {
        this.tableModel = tableModel;
        this.tableView = tableView;
        this.filterView = filterView;
    }

    /**
     * Initializes the main application.
     * Applies handlers and renders initial data.
     */
    init = () =>
    {
        const tableData = this.tableModel.getAllData();
        this.tableView.renderTable(tableData);

        const tableDates = this.tableModel.getAllDatetimes();
        this.filterView.renderDateOptions(tableDates);

        elements.dateOption.on("change", this.filterByDate);
    }

    /**
     * Filters the data by the selection in the 
     * date filter control.
     */
    filterByDate = () =>
    {
        const selection = this.filterView.getSelectedDateOption();
        let filteredData = [];
        if(selection === this.filterView.defaultDateOption){
            filteredData = this.tableModel.getAllData();
        }
        else {
            filteredData = this.tableModel.getDataByDatetime(selection);
        }
        this.tableView.renderTable(filteredData);
    }
}

/**
 * Use an IIFE to run the initialization logic.
 */
(() => 
{
    let controller = new MainController(
        new SightingsTableModel(tableData),
        new SightingsTableView(),
        new FilterView()
    );
    controller.init();
})()
