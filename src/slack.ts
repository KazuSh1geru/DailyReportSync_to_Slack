function sendSlack(e: any, token_key: string, webhookUrl_key: string) {
	// Slackの本文
	let body = createBodyFromResponse(e, token_key);
	let data = {
		text: body,
	};

	let options = {
		method: 'post',
		contentType: 'application/json',
		payload: JSON.stringify(data),
	};

	// 送信チャンネルを分岐させる
	if (token_key == 'oauth_pd') {
		var scriptProperties = PropertiesService.getScriptProperties();
		var webhookUrl = scriptProperties.getProperty(webhookUrl_key);
		UrlFetchApp.fetch(webhookUrl, options);

		// 日報投稿ログを記録する
		addRowToSpreadsheet(e);
	} else if (token_key == 'oauth_reskill') {
		let email = getEmailFromEvent(e);
		var webhookUrl = getPersonalWebhookUrlFromSheet(email);
		UrlFetchApp.fetch(webhookUrl, options);
	} else {
		console.log(`存在しないtoken_key: ${token_key}Slackへ送信できませんでした`);
	}
	console.log('webhook: ' + webhookUrl);
}

// SpreadsheetからSlackのWebhook URLを取得する
function getPersonalWebhookUrlFromSheet(email: string) {
	let config = makeWebhookUrlTableConfig();
	var spreadsheet = SpreadsheetApp.openById(config.sheetId);
	var sheet = spreadsheet.getSheetByName(config.sheetName);
	if (!sheet) {
		// シートが見つからなかった場合のエラーハンドリング
		throw new Error('指定されたシートが見つかりませんでした。');
	}
	var dataRange = sheet.getDataRange();
	var values = dataRange.getValues();

	for (var i = 0; i < values.length; i++) {
		if (values[i][0] == email) {
			console.log(email + 'さんのChannelへ送信します');
			return values[i][1]; // 値の位置に応じて変更
		}
	}
	console.log(email + 'さんのChannelへ送信できませんでした');
	return null; // 見つからなかった場合はnullを返す
}
