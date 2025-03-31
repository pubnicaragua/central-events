function PrintError(tablename, action, error) {
    console.error(`There was an error ${action} ${tablename}: `, error);
}

export default PrintError;