const translate = require('@vitalets/google-translate-api');
const prompt = require('prompt');
const colors = require("colors/safe");

const supportedLang = ['fr', 'en', 'de', 'es', 'vi', 'th', 'ru'];

function formatLang(lang) {
	const split = lang.trim().split([',']);

	if (split.includes('all')) return 'all';
	
	return split.map(el => {
		return el.trim();
	});
}

async function getInfos() {
	prompt.message = "";
	prompt.delimiter = ":";
	prompt.start();

	return await prompt.get([
		{
			name: 'toTranslate',
			description: colors.yellow.underline('Phrase à traduire'),
			type: 'string',
			required: true,
		},
		{
			name: 'lang',
			description: colors.magenta('En quelle langue ? (all is available)'),
			type: 'string',
			default: 'all',
			conform: function (v) {
				const value = v.trim();

				if (value === 'all') return true;

				const lang = value.split(',');
				for (var i = lang.length - 1; i >= 0; i--) {
					if (!supportedLang.includes(lang[i].trim())) return false;
				}
				return true;
			},
			message: "Liste de langues séparée par des ',' ou 'all'",
			required: true,
		},
	]);
}

async function translateEverything(toTranslate, lang) {
	let iterator;
	let stringThatWillBeTranslated = toTranslate;

	if (lang === 'all') iterator = [ ...supportedLang ];
	else iterator = [ ...lang ];

	if (iterator.includes('en')) {
		stringThatWillBeTranslated = (await translate(toTranslate, {to: 'en'})).text;
	}
	for (var i = iterator.length - 1; i >= 0; i--) {
		const translation = await translate(stringThatWillBeTranslated, {to: iterator[i]});
		console.log(colors.green.underline(`${iterator[i]} (from ${translation.from.language.iso}):`));
		console.log(colors.cyan(translation.text), i === 0 ? '' : '\n');
	}
};

async function main() {
	try {
		const { toTranslate, lang } = await getInfos();
		const langFormated = formatLang(lang);
		await translateEverything(toTranslate, langFormated);
	} catch(e) {
		console.log(e);
	}
}

main();