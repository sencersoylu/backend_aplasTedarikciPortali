// for mysql
const filterString = (data, sonuc = "") => {
    if (!data) {
        return "";
    } else if (data && Array.isArray(data[0])) {
        let sonuc2 = "";
        data.forEach((element) => {
            sonuc2 += filterString(element, sonuc);
        });
        return sonuc2;
    } else {
        return (sonuc += filterStringParser(data));
    }
}

const filterStringParser = (data) => {
    return Array.isArray(data) ? mapSelectorToOperator(data[0], data[1], data[2]) : ' ' + data + ' ';
}

const pagingString = (data) => {

    if (data.isLoadingAll || !data.take) {
        return "";
    } else {

        return " LIMIT " + data.take + " OFFSET " + data.skip + " ";
    }

}

const sortingString = (data) => {

    let str = "";

    if (data.sort && Array.isArray(data.sort) && data.sort.length > 0) {

        str = " ORDER BY ";

        const length = data.sort.length;
        data.sort.forEach((s, index) => {
            if (index != length - 1) {
                str = str + s.selector + ' ' + (s.desc ? 'DESC' : 'ASC') + ' , ';
            } else {
                str = str + s.selector + ' ' + (s.desc ? 'DESC' : 'ASC');
            }

        });

    }

    return str;
}

const mapSelectorToOperator = (fieldName, selector, filterValue) => {

    // const allSelectors = ['=', '<>', '<', '<=', '>', '>=', 'contains', 'endswith', 'isblank', 'isnotblank', 'notcontains', 'startswith', 'between', 'anyof', 'noneof'];
    // const stringSelectors = ['contains', 'endswith', 'notcontains', 'startswith', '<>', '='];
    // const numericSelectors = ['=', '<>', '<', '<=', '>', '>=', 'between'];
    // const dateSelectors = ['=', '<>', '<', '<=', '>', '>=', 'between'];

    if(filterValue == null){
        selector = "isblank"
    }


    let queryString;

    switch (selector) {
        case '=':
            queryString = "(" + fieldName + ' = ' + dataTypeControl(filterValue) + ")";
            break;
        case '<>':
            queryString = "(" + fieldName + " IS NULL OR " + fieldName + ' <> ' + dataTypeControl(filterValue) + ")";
            break;
        case '<':
            queryString = "(" + fieldName + ' < ' + dataTypeControl(filterValue) + ")";
            break;
        case '>':
            queryString = "(" + fieldName + ' > ' + dataTypeControl(filterValue) + ")";
            break;
        case '<=':
            queryString = "(" + fieldName + ' <= ' + dataTypeControl(filterValue) + ")";
            break;
        case '>=':
            queryString = "(" + fieldName + ' >= ' + dataTypeControl(filterValue) + ")";
            break;
        case 'contains':
            queryString = "(" + fieldName + " LIKE '%" + filterValue + "%' " + ")";
            break;
        case 'notcontains':
            queryString = "(" + fieldName + " NOT LIKE '%" + filterValue + "%' " + ")";
            break;
        case 'startswith':
            queryString = "(" + fieldName + " LIKE '" + filterValue + "%' " + ")";
            break;
        case 'endswith':
            queryString = "(" + fieldName + " LIKE '%" + filterValue + "' " + ")";
            break;
        case 'isblank':
            queryString = "(" + fieldName + " IS NULL " + ")";
            break;
        // case 'isnotblank':
        //     queryString = "(" + fieldName + " IS NOT NULL " + ")";
        //     break;
        // case 'anyof':
        //     queryString = "(" + fieldName + " IN ('% " + filterValue + "%') " + ")";
        //     break;
        // case 'noneof':
        //     queryString = "(" + fieldName + " NOT IN ( '% " + filterValue + "%') " + ")";
        //     break;
        default:
            queryString = "";

    }

    return queryString;

}

const dataTypeControl = (data) => {

    let queryString = "";

    switch (typeof data) {
        case 'string':
            queryString = " '" + data + "' ";
            break;
        case 'number':
            queryString = data;
            break;
        case 'boolean':
            queryString = data;
            break;
        default:
            queryString = data;
            break;
    }

    return queryString;
}

const createFilteredQueryString = (filterData, rawQuery) => {

    // SELECT * FROM ... WHERE ..... ORDER BY .... LIMIT .. OFSET ...
    let filterStr = filterString(filterData.filter);
    let sortStr = sortingString(filterData);
    let searchStr = searchString(filterData);
    let pageStr = pagingString(filterData);

    return "SELECT t.* FROM (" + rawQuery + ") as t " + (filterStr ? "WHERE " + filterStr : (searchStr ? "WHERE " + searchStr : "")) + sortStr + pageStr;

}

const searchString = (filterData) => {

    let filterStr = "";

    if (filterData.searchExpr && filterData.searchValue) {

        if (!Array.isArray(filterData.searchExpr)) {
            filterStr = mapSelectorToOperator(filterData.searchExpr, filterData.searchOperation, filterData.searchValue);
        }
        else {
            const length = filterData.searchExpr.length;

            filterData.searchExpr.forEach((s, index) => {
                if (index != length - 1) {
                    filterStr = " " + filterStr + mapSelectorToOperator(s, filterData.searchOperation, filterData.searchValue) + " OR ";

                } else {
                    filterStr = " " + filterStr + mapSelectorToOperator(s, filterData.searchOperation, filterData.searchValue) + "";

                }

            });
        }

        return filterStr;

    }
    else {
        return null;
    }

}

const createRecordCountQueryString = (filterData, rawQuery) => {

    let filterStr = filterString(filterData.filter);
    let sortStr = sortingString(filterData);

    if (filterData.requireTotalCount) {
        return "SELECT COUNT(*) as totalCount FROM (" + rawQuery + ") as t " + (filterStr ? "WHERE " + filterStr : "");
    } else {
        return null;
    }

}

const createSummaryQueryString = (filterData, rawQuery) => {

    let filterStr = filterString(filterData.filter);
    let sortStr = sortingString(filterData);

    if (filterData.totalSummary && Array.isArray(filterData.totalSummary) && filterData.totalSummary.length > 0) {

        const parts = [];
        filterData.totalSummary.forEach(s => {

            let lastPart = "(" + s.selector + ") as " + s.selector;

            switch (s.summaryType) {
                case 'sum':
                    parts.push(" SUM" + lastPart + " ");
                    break;
                case 'avg':
                    parts.push(" AVG" + lastPart + " ");
                    break;
                case 'min':
                    parts.push(" MIN" + lastPart + " ");
                    break;
                case 'max':
                    parts.push(" MAX" + lastPart + " ");
                    break;
                case 'count':
                    parts.push(" COUNT" + lastPart + " ");
                    break;
                case 'custom':
                    break;
                
            }
        })

         if(parts.length == 0){
             return null;
         }

        return "SELECT " + parts.join(",")+ " FROM (" + rawQuery + ") as t " + (filterStr ? "WHERE " + filterStr : "") + sortStr;
        
    } else {
        return null;
    }

}

// ******************************************************************************************
// for sqlserver

const filterStringSqlServer = (data, sonuc = "") => {
    if (!data) {
        return "";
    } else if (data && Array.isArray(data[0])) {
        let sonuc2 = "";
        data.forEach((element) => {
            sonuc2 += filterStringSqlServer(element, sonuc);
        });
        return sonuc2;
    } else {
        return (sonuc += filterStringParserSqlServer(data));
    }
}

const filterStringParserSqlServer = (data) => {
    return Array.isArray(data) ? mapSelectorToOperatorSqlServer(data[0], data[1], data[2]) : ' ' + data + ' ';
}

const mapSelectorToOperatorSqlServer = (fieldName, selector, filterValue) => {

    // const allSelectors = ['=', '<>', '<', '<=', '>', '>=', 'contains', 'endswith', 'isblank', 'isnotblank', 'notcontains', 'startswith', 'between', 'anyof', 'noneof'];
    // const stringSelectors = ['contains', 'endswith', 'notcontains', 'startswith', '<>', '='];
    // const numericSelectors = ['=', '<>', '<', '<=', '>', '>=', 'between'];
    // const dateSelectors = ['=', '<>', '<', '<=', '>', '>=', 'between'];

    let queryString;

    switch (selector) {
        case '=':
            queryString = "(" + fieldName + ' = ' + dataTypeControlSqlServer(filterValue) + ")";
            break;
        case '<>':
            queryString = "(" + fieldName + " IS NULL OR " + fieldName + ' <> ' + dataTypeControlSqlServer(filterValue) + ")";
            break;
        case '<':
            queryString = "(" + fieldName + ' < ' + dataTypeControlSqlServer(filterValue) + ")";
            break;
        case '>':
            queryString = "(" + fieldName + ' > ' + dataTypeControlSqlServer(filterValue) + ")";
            break;
        case '<=':
            queryString = "(" + fieldName + ' <= ' + dataTypeControlSqlServer(filterValue) + ")";
            break;
        case '>=':
            queryString = "(" + fieldName + ' >= ' + dataTypeControlSqlServer(filterValue) + ")";
            break;
        case 'contains':
            queryString = "(" + fieldName + " LIKE '%" + filterValue + "%' " + ")";
            break;
        case 'notcontains':
            queryString = "(" + fieldName + " NOT LIKE '%" + filterValue + "%' " + ")";
            break;
        case 'startswith':
            queryString = "(" + fieldName + " LIKE '" + filterValue + "%' " + ")";
            break;
        case 'endswith':
            queryString = "(" + fieldName + " LIKE '%" + filterValue + "' " + ")";
            break;
        // case 'isblank':
        //     queryString = "(" + fieldName + " IS NULL " + ")";
        //     break;
        // case 'isnotblank':
        //     queryString = "(" + fieldName + " IS NOT NULL " + ")";
        //     break;
        // case 'anyof':
        //     queryString = "(" + fieldName + " IN ('% " + filterValue + "%') " + ")";
        //     break;
        // case 'noneof':
        //     queryString = "(" + fieldName + " NOT IN ( '% " + filterValue + "%') " + ")";
        //     break;
        default:
            queryString = "";

    }

    return queryString;

}

const dataTypeControlSqlServer = (data) => {

    let queryString = "";

    switch (typeof data) {
        case 'string':
            queryString = " '" + data + "' ";
            break;
        case 'number':
            queryString = data;
            break;
        case 'boolean':
            queryString = data;
            break;
    }

    return queryString;
}

const pagingStringSqlServer = (data, sql) => {

    if (data.isLoadingAll || !data.take) {
        return sql; // sql ifadesi ORDER BY içermemeli. aksi halde sql server hata veriyor!!
    } else {
        return sql + " OFFSET " + data.skip + " ROWS FETCH NEXT " + data.take + " ROWS ONLY";
    }

}

const sortingStringSqlServer = (data) => {

    let str = " ORDER BY (SELECT NULL) ";

    if (data.sort && Array.isArray(data.sort) && data.sort.length > 0) {

        const length = data.sort.length;
        data.sort.forEach(s => {

            str += ' , ' + s.selector + ' ' + (s.desc ? 'DESC' : 'ASC');

        });

    }

    return str;
}

const searchStringSqlServer = (filterData) => {

    let filterStr = "";

    if (filterData.searchExpr && filterData.searchValue) {

        const length = filterData.searchExpr.length;
        filterData.searchExpr.forEach((s, index) => {
            if (index != length - 1) {
                filterStr = " " + filterStr + mapSelectorToOperatorSqlServer(s, filterData.searchOperation, filterData.searchValue) + " OR ";

            } else {
                filterStr = " " + filterStr + mapSelectorToOperatorSqlServer(s, filterData.searchOperation, filterData.searchValue) + "";

            }

        });

        return filterStr;

    }
    else {
        return null;
    }

}

const createFilteredQueryStringSqlServer = (filterData, rawQuery) => {

    // SELECT * FROM ... WHERE ..... ORDER BY .... LIMIT .. OFSET ...
    let filterStr = filterStringSqlServer(filterData.filter);
    let sortStr = sortingStringSqlServer(filterData);
    let searchStr = searchStringSqlServer(filterData);

    const sql = "SELECT t.* FROM (" + rawQuery + ") as t " + (filterStr ? "WHERE " + filterStr : (searchStr ? "WHERE " + searchStr : " ")) + sortStr;
    return pagingStringSqlServer(filterData, sql);

}

const createRecordCountQueryStringSqlServer = (filterData, rawQuery) => {

    let filterStr = filterStringSqlServer(filterData.filter);
    let sortStr = sortingStringSqlServer(filterData);

    if (filterData.requireTotalCount) {
        return "SELECT COUNT(*) as totalCount FROM (" + rawQuery + ") as t " + (filterStr ? "WHERE " + filterStr : " ");
    } else {
        return null;
    }

}

const createSummaryQueryStringSqlServer = (filterData, rawQuery) => {

    let filterStr = filterStringSqlServer(filterData.filter);
    let sortStr = sortingStringSqlServer(filterData);

    if (filterData.totalSummary && Array.isArray(filterData.totalSummary) && filterData.totalSummary.length > 0) {

        const parts = [];
        filterData.totalSummary.forEach(s => {

            let lastPart = "(" + s.selector + ") as " + s.selector;

            switch (s.summaryType) {
                case 'sum':
                    parts.push(" SUM" + lastPart + " ");
                    break;
                case 'avg':
                    parts.push(" AVG" + lastPart + " ");
                    break;
                case 'min':
                    parts.push(" MIN" + lastPart + " ");
                    break;
                case 'max':
                    parts.push(" MAX" + lastPart + " ");
                    break;
                case 'count':
                    parts.push(" COUNT" + lastPart + " ");
                    break;
            }
        })


        return "SELECT " + parts.join(",") + " FROM (" + rawQuery + ") as t " + (filterStr ? "WHERE " + filterStr : "") + sortStr;
    } else {
        return null;
    }

}


module.exports = {

    createFilteredQueryString,
    createRecordCountQueryString,
    createSummaryQueryString,

    createFilteredQueryStringSqlServer,
    createRecordCountQueryStringSqlServer,
    createSummaryQueryStringSqlServer,

};