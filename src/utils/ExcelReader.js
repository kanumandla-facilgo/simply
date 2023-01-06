const xlsx    = require("xlsx");
const Err     = require("../bo/err");

class ExcelReader {

    // constructor(validHeaderlist) {
    //     this.validHeaderList = validHeaderlist;
    // }

    constructor() {
    }

    readSync(fileWithPath) {
        this.workbook = xlsx.readFile(fileWithPath, {cellDates: true});
        this.sheet_name_list = this.workbook.SheetNames;
    }

    parseFile(fileWithPath, validHeaderList, callback) {

        let data = [];
        let object;
        let errorList = [];
 
        //read the file
        this.readSync(fileWithPath);

        // save the variables to local as it requires local
        let workbook = this.workbook; 
        //let validHeaderList = this.validHeaderList;
 
        let self = this;
        this.sheet_name_list.forEach(function(y) { 
            let worksheet = workbook.Sheets[y];
            let headers = {};
//            let columnList = [];
            let previousRowNumber = 1;
            for (let i in worksheet) {

                // all keys that do not begin with "!" correspond to cell addresses
                if(i[0] === '!' || i[0] === "!ref") continue;
                var col = i.replace(/[0-9]/g, '')
                var row = parseInt(i.replace(/[A-Z]/g, ''));
                var value = worksheet[i].v;
                var formattedValue = worksheet[i].w;
  
                //store header names
                if (row == 1) {

                    //check if header is valid
                    
                    let filteredHeader = validHeaderList.filter(function(columObj) {return (columObj.name.toLowerCase() == value.toLowerCase()); });
                    if (filteredHeader.length == 0) {
                        errorList.push("Invalid column: " + value);
                        return callback(errorList, null);
                    } 

                    // saving header information
                    headers[col] = filteredHeader[0];
    
                }
                // if first 
                if (row == 2 && errorList.length > 0) {
                    let err = new Err();
                    err.code    = 404;
                    err.message = JSON.stringify(errorList);
                    return callback(err, null);
                }
    
                //if new row, create new object to store all the columns
                if (row != previousRowNumber) {
                    object = {};
                    data.push(object);
                    previousRowNumber = row;
                }

                if (row > 1) {
                    let errorList = self.validateField(headers[col], value);
                    if (errorList.length > 0) {
                        return callback(errorList);
                    }
                    if (headers[col].type == "date") {
						
                        if (formattedValue != null && formattedValue != undefined && formattedValue != "") {
                            let moment = require("moment");
                            object[headers[col].name] = moment(formattedValue, "DD-MM-YYYY").format("YYYY-MM-DD");
                            //console.log(formattedValue, value);
                            //let convertedDate = require("xlsx").SSF.parse_date_code(value, {date1904: false});
                            // convertedDate.m, convertedDate.d, convertedDate.y
                            //console.log(convertedDate);
                        }
                        else
                            object[headers[col].name] = null;
                    } else {
                        object[headers[col].name] = value;
                    }
                }
    
            }
    
        });

        return callback(errorList, data);
    
    }

    validateField(columnDefinition, value) {

        if (!value) return true;

        let errorList = [];

        switch (columnDefinition) {

            case "string":
                if (columnDefinition.length < value.length) {
                    errorList.push("Value for column " + columnDefinition.name + " exceeds length of " + columnDefinition.length);
                }
                if (columnDefinition.constraints && columnDefinition.constraints.length > 0) {
                    for (let i = 0; i < columnDefinition.constraints.length; i++) {
                        let constraint = columnDefinition.constraints[i];
                        if (constraint.type == "in") {
                            let filterInContraint =  constraint.filter(function (inValue) {
                                return (inValue == value);
                            });

                            //check the size of filtered array.
                            if (filterInContraint.length == 0) {
                                errorList.push("Value " + value + " is not part of possible value list.");
                                return errorList;
                            }
                        }
                    }
                }
                break;
            default:
                return errorList;

        }

        return errorList;
    }

}
module.exports = ExcelReader;