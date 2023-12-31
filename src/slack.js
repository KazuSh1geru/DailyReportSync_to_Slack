function sendSlack(e, token_key, webhook_url_key) {
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
		var webhook_url = scriptProperties.getProperty(webhook_url_key);
		UrlFetchApp.fetch(webhook_url, options);

		// 日報投稿ログを記録する
		addRowToSpreadsheet(e);
	} else if (token_key == 'oauth_reskill') {
		let email = getEmailFromEvent(e);
		var webhook_url = getPersonalWebhookUrlFromSheet(email);
		UrlFetchApp.fetch(webhook_url, options);
	} else {
		console.log(`存在しないtoken_key: ${token_key}Slackへ送信できませんでした`);
	}
	console.log('webhook: ' + webhook_url);
}

// SpreadsheetからSlackのWebhook URLを取得する
function getPersonalWebhookUrlFromSheet(email) {
	let config = makeWebhookUrlTableConfig();
	var spreadsheet = SpreadsheetApp.openById(config.sheet_id);
	var sheet = spreadsheet.getSheetByName(config.sheet_name);
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
