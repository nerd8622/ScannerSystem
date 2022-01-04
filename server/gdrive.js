const {google} = require('googleapis');

module.exports = class GoogleDrive {
    constructor(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN) {
        const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
        client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
        this.driveClient = google.drive({version: 'v3', auth: client});
        this.sheetsClient = google.sheets({version: 'v4', auth: client});
    }

    uploadFile(fileName, fileStream, fileMimeType, folderId) {
        return this.driveClient.files.create({
            requestBody: {
                name: fileName,
                mimeType: fileMimeType,
                parents: folderId ? [folderId] : []
            },
            paramaters: {
                convert: true
            },
            media: {
                mimeType: fileMimeType,
                body: fileStream
            }
        });
    }

    uploadCsv(fileName, fileStream, folderId) {
        return this.driveClient.files.create({
            requestBody: {
                name: fileName,
                mimeType: "application/vnd.google-apps.spreadsheet",
                parents: folderId ? [folderId] : []
            },
            paramaters: {
                convert: true
            },
            media: {
                mimeType: "text/csv",
                body: fileStream
            }
        });
    }

    createSheet(sheetName) {
        const resource = {properties: {title: sheetName}}
        return this.sheetsClient.spreadsheets.create({
            resource,
            fields: 'spreadsheetId'
        });
    }

    appendSheet(sheetId, values){
        return this.sheetsClient.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: "A2:E9999",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [values]
            }
        });
    }

    clearSheet(sheetId){
        return this.sheetsClient.spreadsheets.values.clear({
            spreadsheetId: sheetId,
            range: "A2:E9999"
        });
    }

    copyFile(fileId, newName){
        return this.driveClient.files.copy({fileId: fileId, requestBody: {name: newName}});
    }

    rename(fileId, newName){
        return this.driveClient.files.update({fileId: fileId, requestBody: {name: newName}});
    }
}

