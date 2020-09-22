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
    ufoTableBody: d3.select("#ufo-table>tbody"),
    resetButton: d3.select("#reset-btn"),
    dateOption: d3.select("#datetime"),
    cityOption: d3.select("#city"),
    stateOption: d3.select("#state"),
    countryOption: d3.select("#country"),
    shapeOption: d3.select("#shape"),
};

/**
 * Gets unique values from an array.
 * From https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
 */
unique = (array) =>
{
    return [...new Set(array)]; 
}

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
        this.currentData = data;
    }

    /**
     * Gets all the data within the table.
     */
    getAllData = () => this.data;

    /**
     * Sets the current table data.
     * @param {any[]} data table data
     */
    setCurrentData = (data) => this.currentData = data;

    /**
     * Filters a property of the table on a value.
     * @param {string} filterBy Property to filter.
     * @param {string} value Value to filter on.
     */
    getCurrentDataByFilterValue = (filterBy, value) => 
        this.currentData.filter(point => point[filterBy] === value);
    
    /**
     * Gets all values under a filterable value.
     * @param {string} filterBy Which property to get the values of.
     */
    getUniqueCurrentDataByFilter = (filterBy) => {
        const values = this.currentData.map(point => point[filterBy]);
        return unique(values);
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
class FilterView {

    /**
     * This represents a filter control on the view.
     * @param {d3 element} optionElement The HTML element that corresponds to the filter.
     * @param {string} defaultValue The default value of the filter. Should represent no filter.
     */
    constructor(optionElement, defaultValue){
        this.optionElement = optionElement;
        this.defaultValue = defaultValue;
    }

    /**
     * Gets the default value for the filter.
     */
    getDefaultValue = () => this.defaultValue;

    /**
     * Gets the HTML element for the filter.
     */
    getElement = () => this.optionElement;

    /**
     * Clears all options but the default.
     */
    clearOptions = () => {
        this.optionElement.html("");
        this.renderOption(this.defaultValue);
    }

    /**
     * Gets the currently selected option.
     */
    getSelectedOption = () => this.optionElement.property("value");

    /**
    * Sets the selected option.
    */
    setSelectedOption = (optionValue) =>  this.optionElement.property("value", optionValue);

    /**
    * Renders options in the filter control.
    * @param {string} optionValues 
    * The dates to render as options.
    */
    renderOptions = (optionValues) => {
        this.clearOptions();
        optionValues.forEach(this.renderOption);
    }

    /**
     * Renders a single option in the filter.
     * @param {string} optionValue The option to render.
     */
    renderOption = (optionValue) => {
        const option = this.optionElement.append("option");
        option.text(optionValue);
    }
}

/**
 * Handles the main logic.
 */
class MainController
{
    constructor(
        tableModel, 
        tableView, 
        dateFilterView,
        cityFilterView,
        stateFilterView,
        countryFilterView,
        shapeFilterView
    ){
        this.tableModel = tableModel;
        this.tableView = tableView;
        this.filterViews = {
            datetime : dateFilterView,
            city : cityFilterView,
            state : stateFilterView,
            country : countryFilterView,
            shape : shapeFilterView
        }
    }

    /**
     * Initializes the main application.
     * Applies handlers and renders initial data.
     */
    init = () =>
    {
        const tableData = this.tableModel.getAllData();
        this.tableView.renderTable(tableData);
        Object.entries(this.filterViews).map(([filter, view])=> {
            const tableValues = this.tableModel.getUniqueCurrentDataByFilter(filter);
            view.renderOptions(tableValues);
            view.getElement().on("change", () => this.filter());
        });
        elements.resetButton.on("click", () => this.resetFilters());
    }

    /**
     * Reloads the options for a filter.
     * @param {string} filter The filter property.
     * @param {FilterView} view The filter view.
     */
    reloadFilterOptions = (filter, view) =>{
        const selection = view.getSelectedOption();
        const tableValues = this.tableModel.getUniqueCurrentDataByFilter(filter);
        view.renderOptions(tableValues);
        view.setSelectedOption(selection);
    }

    /**
     * Applies all filters to the table.
     */
    filter = () => {
        // Filter the data
        let filteredData = this.tableModel.getAllData();
        Object.entries(this.filterViews).map(([filter, view])=> {
            const selection = view.getSelectedOption();
            if(selection !== view.getDefaultValue()){
                filteredData = filteredData.filter(point => point[filter] === selection);
            }
        });

        // Render Data
        this.tableView.renderTable(filteredData);
        this.tableModel.setCurrentData(filteredData);

        // Filter the options
        Object.entries(this.filterViews).map(([filter, view])=> {
            this.reloadFilterOptions(filter, view)
        });
    }

    /**
     * Resets all filters on the table.
     */
    resetFilters = () => {
        Object.entries(this.filterViews).map(([filter, view])=> {
            view.setSelectedOption(view.getDefaultValue());
        })
        this.filter();
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
        new FilterView(elements.dateOption, "All"),
        new FilterView(elements.cityOption, "All"),
        new FilterView(elements.stateOption, "All"),
        new FilterView(elements.countryOption, "All"),
        new FilterView(elements.shapeOption, "All")
    );
    controller.init();
})()
