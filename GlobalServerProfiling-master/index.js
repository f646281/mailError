const nodemailer = require('nodemailer');
//const stringSimilarity = require('string-similarity');
const bodyParser = require('body-parser');
var CronJob = require('cron').CronJob;
var admin = require("firebase-admin");
var serviceAccount = require("./automaticglobal-5fc08-firebase-adminsdk-ngnum-7a6f5034d7.json");


/* Web Scraping */
const cheerio = require('cheerio');
const request = require('request');

/* Express ( interfaz web ) */
const express = require('express'),
	app = express();

/* Esto permite que desde cualquier pagina web se envien peticiones de ajax*/
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://automaticglobal-5fc08.firebaseio.com"
});

/* Seguimos con el cuerpo */
app.use(bodyParser.urlencoded({
	extended: false
}))
app.use(bodyParser.json())

let port = process.env.PORT;
//let port = 3000;

app.listen(port, function () {
	console.log('Servidor funcionando en el puerto ' + port + '!');
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/home/index.html');
});

/* Funcion para enviar correo con el grupo */
app.post('/enviar', function (req, res) {

	let mensaje = req.body.mensaje;
	let html = req.body.html;
	let asunto = req.body.asunto;
	let receptor = req.body.receptor + ", automatic.global@netquest.com";
	/* Recogida provisional de datitos */
	let fe = req.body.fecha;
	let ho = req.body.hora;
	let ti = req.body.time;

	if (fe == "" || fe == "undefined" || fe == null) {
		fe = "ND";
	}
	console.log("Fecha: ", fe);
	if (ho == "" || ho == "undefined" || ho == null) {
		ho = "ND";
	}
	console.log("Hora: ", ho);
	if (ti == "" || ti == "undefined" || ti == null) {
		ti = "ND";
	}
	console.log("Fecha: ", fe);

	/* Arrays de errores descartados */
	var arr2 = ["You already participated in this survey, thank you!", "Ya participaste en esta encuesta. ¡Gracias!", "You already participated in this survey, thank you!", "You already participated in this survey, thank you!", "Você já participou deste inquérito. Obrigada!", "Você já participou desta pesquisa. Obrigada!", "感谢您参与本次调查！", "השתתפת בסקר זה. תודה", "Du hast bereits an dieser Umfrage teilgenommen.", "Vous avez déjà participé à cette enquête. Merci!", "Hai già partecipato al sondaggio, grazie!"];
	var arr3 = ["Survey completed", "Encuesta finalizada", "Survey completed", "Survey completed", "Inquérito finalizado.", "Pesquisa finalizada.", "完成问卷", "סקר הושלם", "Umfrage abgeschlossen", "Enquête clôturée.", "Sondaggio completato"];
	var arr4 = ["Your answers were saved correctly. Thanks for participating.", "Tus respuestas fueron guardadas correctamente. Gracias por participar.", "Your answers were saved correctly. Thanks for participating.", "Your answers were saved correctly. Thanks for participating.", "As suas respostas foram guardadas corretamente. Obrigada por participar.", "Suas respostas foram guardadas corretamente. Obrigada por participar.", "您的回答已被正确保存，谢谢您的参与。", "תשובותיך ניצלו בצורה נכונה. תודה לך על השתתפותך.", "Deine Antworten wurden korrekt gespeichert.", "Vielen Dank für die Teilnahme.", "Vos réponses ont été correctement enregistrées. Merci pour votre participation.", "Le tue risposte sono state salvate correttamente. Grazie per aver partecipato"];
	var arr9 = ["This survey has obtained the necessary number of responses. Thanks for your interest!", "Esta encuesta ya consiguió el número de respuestas necesarias. ¡Gracias por tu interés!", "This survey has obtained the necessary number of responses. Thanks for your interest!", "This survey has obtained the necessary number of responses. Thanks for your interest!", "Este inquérito já possui o número de respostas necessárias. Obrigada pelo interesse.", "Esta pesquisa já possui o número de respostas necessárias. Obrigada pelo interesse.", "这份问卷已经搜集到所需数量。感谢您的关注！", "סקר זה השיג את המספר הדרוש של תגובות. תודה על ההתעניינות!", "Diese Umfrage hat bereits genügend Antworten erhalten. Vielen Dank für dein Interesse.", "Il y a déjà suffisamment de réponses pour cette enquête. Merci pour  votre intérêt!", "Questo sondaggio ha ottenuto un numero sufficiente di risposte. Grazie per il tuo interesse"];
	var arr16 = ["Too many attempts. Please try from another browser or device. Thank you!", "Demasiados intentos. Accede desde otro navegador o dispositivo. ¡Gracias!", "Too many attempts. Please try from another browser or device. Thank you!", "Too many attempts. Please try from another browser or device. Thank you!", "Muitas tentativas. Aceda de outro navegador ou dispositivo. Obrigada.", "Muitas tentativas. Acesse de outro navegador ou dispositivo. Obrigada.", "访问重试次数太多，请尝试从另一浏览器或设备访问。谢谢！", "ניסיונות רבים מדי. לגשת בדפדפן או במכשיר אחר. תודה!", "Zu viele Anläufe. Bitte versuche es mit einem anderen Browser oder Gerät. Vielen Dank!", "Trop de tentatives. Réessayez s'il vous plaît avec un autre navigateur et/ou un dispositif différent.", "Troppi tentativi di accesso- Per favore prova ad accedere da un altro browsero dispositivo. Grazie!"];
	var arr17 = ["Page temporarily unavailable. Please come back later. Thank you!", "El contenido de esta página no está disponible temporalmente. Vuelve más tarde. ¡Gracias!", "Page temporarily unavailable. Please come back later. Thank you!", "Page temporarily unavailable. Please come back later. Thank you!", "O conteúdo desta página não está disponível temporariamente. Volte mais tarde. Obrigada.", "O conteúdo desta página não está disponível temporariamente. Volte mais tarde. Obrigada.", "该页面内容暂不可用，请稍后回来，谢谢！", "התוכן באתר זה אינו זמין באופן זמני. חזור שוב מאוחר יותר. תודה!", "Der Inhalt dieser Seite ist momentan nicht verfügbar. Bitte versuche es später noch einmal. Vielen Dank!", "Le contenu de cette page est temporairement indisponible.", "Revenez plus tard. Merci!", "La pagina non è al momento disponibile, riprova più tardi, grazie!"]
	var arr18 = ["شكراً، لقد انتهت هذه المشاركة بالفعل.", "Това участие е приключило вече, благодаря.", "Aquesta participació ja ha finalitzat, gràcies.", "Denne undersøgelse er allerede slut tak!", "Sie haben bereits an dieser Umfrage teilgenommen.", "Αυτή η συμμετοχή έχει ήδη ολοκληρωθεί, σας ευχαριστούμε.", "You already participated in this survey, thank you!", "Ya participaste en esta encuesta. ¡Gracias!", "Esta participación ya ha finalizado, gracias.", "Parte hartze hau amaitu da dagoeneko, eskerrik asko.", "Osallistumisesi on jo rekisteröity.", "Vous avez déjà participé à cette enquête. Merci!", "A túa participación rematou. Grazas", "השתתפת בסקר זה. תודה", "A részvétel már befejeződött, köszönjük.", "Hai già partecipato al sondaggio, grazie!", "参加受付はすでに締め切りました。ありがとうございます。", "You already participated in this survey, thank you!", "Această participare este deja finisată, vă mulţumesc.", "Deze deelname is reeds afgewerkt, dank u.", "Deze deelname is reeds afgewerkt, dank u.", "Denne deltakelsen er ferdig allerede", "Udział został zakończony, dziękujemy.", "Você já participou desta pesquisa. Obrigada!", "Você já participou deste inquérito. Obrigada!", "Această participare a luat sfârșit, vă mulțumim.", "Это исследование уже завершено, спасибо!", "Deltagandet har redan avslutats. Tack.", "การเข้าร่วมในครั้งนี้เสร็จเรียบร้อยแล้ว ขอบคุณ", "Bu katılım tamamlandı, teşekkürler.", "此次参与已经完成，谢谢。", "感谢您参与本次调查！"]
	var arr19 = ["مشاركة منتهية", "Приключило участие", "Participació finalitzada", "Undersøgelsen er gennemført", "Umfrage abgeschlossen", "Ολοκληρωμένη συμμετοχή", "Survey completed", "Encuesta finalizada", "Participación finalizada", "Encuesta finalizada", "Parte hartzea amaitua", "Osallistumisesi on rekisteröity.", "Enquête clôturée.", "Enquisa rematada.", "סקר הושלם", "A részvétel befejeződött", "Sondaggio completato", "参加受付終了", "Survey completed", "Participare finisată", "Afgewerkte deelname", "Afgewerkte deelname", "Ferdig deltakelse", "Zakończony udział", "Pesquisa finalizada.", "Inquérito finalizado.", "Participare încheiată", "Завершенное исследование", "Avslutat deltagande", "การเข้าร่วมเสร็จเรียบร้อยแล้ว", "Katılım tamamlandı", "完成参与", "完成问卷"]
	var arr20 = ["شكراً للإجابة على استطلاع الرأي.", "Благодаря за отговорите на  проучването.", "Gràcies per respondre l'enquesta.", "Tak fordi du valgte at deltage i spørgeundersøgelsen.", "Ihre Antworten wurden korrekt gespeichert. Vielen Dank für die Teilnahme.", "Σας ευχαριστούμε που απαντήσατε στην έρευνα.", "Your answers were saved correctly. Thanks for participating.", "Tus respuestas fueron guardadas correctamente. Gracias por participar.", "Gracias por contestar la encuesta.", "Tus respuestas fueron guardadas correctamente. Gracias por participar.", "Eskerrik asko inkesta erantzuteagatik.", "Kiitos tutkimukseen osallistumisesta.", "Vos réponses ont été correctement enregistrées. Merci pour votre participation.", "Grazas por participar na enquisa.", "תשובותיך ניצלו בצורה נכונה. תודה לך על השתתפותך.", "Köszönjük, hogy kitöltötte a kérdőívet.", "Le tue risposte sono state salvate correttamente. Grazie per aver partecipato", "アンケートにご回答いただきありがとうございます。", "Your answers were saved correctly. Thanks for participating.", "Vă mulţumim pentru că aţi răspuns la sondaj.", "Bedankt om de enquête in te vullen.", "Bedankt om de enquête in te vullen.", "Takk for besvarelsen", "Dziękujemy za wypełnienie ankiety.", "Suas respostas foram guardadas corretamente. Obrigada por participar.", "As suas respostas foram guardadas corretamente. Obrigada por participar.", "Vă mulțumim pentru că ați răspuns la sondaj.", "Спасибо за участие в опросе.", "Tack för att du har svarat på enkäten.", "ขอบคุณสำหรับการตอบแบบสำรวจ", "Anketi yanıtladığınız için teşekkürler.", "感谢填写调查问卷。", "您的回答已被正确保存，谢谢您的参与。"]


	/* Funcion de comprobacion de similitud */
	var descarte = 0;
	arr2.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr3.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr4.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr9.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr16.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr17.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr18.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr19.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr20.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	if (mensaje == "" || mensaje == undefined || mensaje == null) {
		descarte = 1;
	}
	console.log("Descartev2: ", descarte);
	if (descarte == 0) {
		/* Calcular el tiempo del envio del email */
		var ahora = new Date();
		var d = ahora.getDate(); var y = ahora.getFullYear(); var m = ahora.getMonth();
		var s = ahora.getSeconds(); var min = ahora.getMinutes(); var h = ahora.getHours();
		var hora = h + ":" + min + ":" + s; hora = hora.toString();
		var fecha = d + "/" + m + "/" + y; fecha = fecha.toString();
		time = ahora.getTime();
		/* Fin de calculo del tiempo */

		var tempReceptor = receptor.split(",")[0];
		tempReceptor = tempReceptor.split("@")[0];
		/* Enviamos el email en la funcion */
		EnviarEmail(html, mensaje, asunto, receptor);
		/* Escribir datos */

		/*var databaseService = admin.database();
		var referencia = databaseService.ref('Emails/' + tempReceptor + "/" + time);

		referencia.set({
			mensaje: mensaje,
			asunto: asunto,
			receptor: tempReceptor,
			time: time,
			fecha: fecha,
			hora: hora,
			fechaEnvio: fe,
			horaEnvio: ho,
			tiempoEnvio: ti
		}).then(function () { //Se escribe el dato 
			console.log('dato almacenado correctamente');
		}).catch(function (error) { // No se escribe el dato 
			console.log('detectado un error', error);
		});		*/
		let db = admin.firestore();

		let docRef = db.collection('Emails').doc();

		docRef.set({
			scripter: tempReceptor,
			mensaje: mensaje,
			asunto: asunto,
			receptor: tempReceptor,
			time: time,
			fecha: fecha,
			hora: hora
		}).then(function () { //Se escribe el dato 
			console.log('dato almacenado correctamente');
		}).catch(function (error) { // No se escribe el dato 
			console.log('detectado un error', error);
		});

		res.send(" Mensaje enviado");
	} else {
		res.send(" Mensaje fallido");
	}
});

/* Funcion para enviar el email */
function EnviarEmail(html, mensaje, asunto, receptor) {
	console.log("Creating transport...");
	let transporter = nodemailer.createTransport({
		service: 'gmail', //al usar un servicio bien conocido, no es necesario proveer un nombre de servidor.
		auth: {
			user: 'automatic.global.netquest@gmail.com',
			pass: 'AH;*fJ~0@]0Vs~|lC0zu'
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	let mailOptions = {
		from: 'automatic.global.netquest@gmail.com',
		to: receptor,
		subject: asunto,
		text: mensaje,
		html: html
	};
	console.log("sending email", mailOptions);
	transporter.sendMail(mailOptions, function (error, info) {
		console.log("senMail returned!");
		if (error) {
			console.log("Error: ", error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	console.log("End of Script");
}



new CronJob('0 0 7 * * 1-5', function () {
	//new CronJob('0 58 9 * * *', function () {
	console.log('Se envia un mensaje para confirmar que el servidor esta levantado');

	request('https://proverbia.net/frase-del-dia', (err, result, body) => {
		if (!err && result.statusCode == 200) {
			let $ = cheerio.load(body);
			var fraseToday = $("blockquote.bsquote p").eq(0).text();
			var autor = $("blockquote.bsquote footer a").eq(0).text();

			//Envio del mensaje
			var html = "";
			var mensaje = fraseToday + " - " + autor;
			var receptor = "jromero@netquest.com, acastany@netquest.com";
			var asunto = "Servidor encendido y funcionando";
			console.log("mensaje: ", mensaje);
			EnviarEmailGlobal(html, mensaje, asunto, receptor);

		} else {
			//Envio del mensaje
			var html = "";
			var mensaje = "Buenos dias ! servidor encendido y funcionando"
			var receptor = "jromero@netquest.com";
			var asunto = "Servidor encendido y funcionando";
			console.log("mensaje: ", mensaje);
			EnviarEmailGlobal(html, mensaje, asunto, receptor);
		}
	});



}, null, true, 'Europe/Madrid');

/* Funcion para enviar correo sin el grupo */
app.post('/enviarProfiling', function (req, res) {

	let mensaje = req.body.mensaje;
	let html = req.body.html;
	let asunto = req.body.asunto;
	let receptor = req.body.receptor;
	/* Recogida provisional de datitos */
	let fe = req.body.fecha;
	let ho = req.body.hora;
	let ti = req.body.time;

	if (fe == "" || fe == "undefined" || fe == null) {
		fe = "ND";
	}
	console.log("Fecha: ", fe);
	if (ho == "" || ho == "undefined" || ho == null) {
		ho = "ND";
	}
	console.log("Hora: ", ho);
	if (ti == "" || ti == "undefined" || ti == null) {
		ti = "ND";
	}
	console.log("Fecha: ", fe);


	/* Arrays de errores descartados */
	var arr2 = ["You already participated in this survey, thank you!", "Ya participaste en esta encuesta. ¡Gracias!", "You already participated in this survey, thank you!", "You already participated in this survey, thank you!", "Você já participou deste inquérito. Obrigada!", "Você já participou desta pesquisa. Obrigada!", "感谢您参与本次调查！", "השתתפת בסקר זה. תודה", "Du hast bereits an dieser Umfrage teilgenommen.", "Vous avez déjà participé à cette enquête. Merci!", "Hai già partecipato al sondaggio, grazie!"];
	var arr3 = ["Survey completed", "Encuesta finalizada", "Survey completed", "Survey completed", "Inquérito finalizado.", "Pesquisa finalizada.", "完成问卷", "סקר הושלם", "Umfrage abgeschlossen", "Enquête clôturée.", "Sondaggio completato"];
	var arr4 = ["Your answers were saved correctly. Thanks for participating.", "Tus respuestas fueron guardadas correctamente. Gracias por participar.", "Your answers were saved correctly. Thanks for participating.", "Your answers were saved correctly. Thanks for participating.", "As suas respostas foram guardadas corretamente. Obrigada por participar.", "Suas respostas foram guardadas corretamente. Obrigada por participar.", "您的回答已被正确保存，谢谢您的参与。", "תשובותיך ניצלו בצורה נכונה. תודה לך על השתתפותך.", "Deine Antworten wurden korrekt gespeichert.", "Vielen Dank für die Teilnahme.", "Vos réponses ont été correctement enregistrées. Merci pour votre participation.", "Le tue risposte sono state salvate correttamente. Grazie per aver partecipato"];
	var arr9 = ["This survey has obtained the necessary number of responses. Thanks for your interest!", "Esta encuesta ya consiguió el número de respuestas necesarias. ¡Gracias por tu interés!", "This survey has obtained the necessary number of responses. Thanks for your interest!", "This survey has obtained the necessary number of responses. Thanks for your interest!", "Este inquérito já possui o número de respostas necessárias. Obrigada pelo interesse.", "Esta pesquisa já possui o número de respostas necessárias. Obrigada pelo interesse.", "这份问卷已经搜集到所需数量。感谢您的关注！", "סקר זה השיג את המספר הדרוש של תגובות. תודה על ההתעניינות!", "Diese Umfrage hat bereits genügend Antworten erhalten. Vielen Dank für dein Interesse.", "Il y a déjà suffisamment de réponses pour cette enquête. Merci pour  votre intérêt!", "Questo sondaggio ha ottenuto un numero sufficiente di risposte. Grazie per il tuo interesse"];
	var arr16 = ["Too many attempts. Please try from another browser or device. Thank you!", "Demasiados intentos. Accede desde otro navegador o dispositivo. ¡Gracias!", "Too many attempts. Please try from another browser or device. Thank you!", "Too many attempts. Please try from another browser or device. Thank you!", "Muitas tentativas. Aceda de outro navegador ou dispositivo. Obrigada.", "Muitas tentativas. Acesse de outro navegador ou dispositivo. Obrigada.", "访问重试次数太多，请尝试从另一浏览器或设备访问。谢谢！", "ניסיונות רבים מדי. לגשת בדפדפן או במכשיר אחר. תודה!", "Zu viele Anläufe. Bitte versuche es mit einem anderen Browser oder Gerät. Vielen Dank!", "Trop de tentatives. Réessayez s'il vous plaît avec un autre navigateur et/ou un dispositif différent.", "Troppi tentativi di accesso- Per favore prova ad accedere da un altro browsero dispositivo. Grazie!"];
	var arr17 = ["Page temporarily unavailable. Please come back later. Thank you!", "El contenido de esta página no está disponible temporalmente. Vuelve más tarde. ¡Gracias!", "Page temporarily unavailable. Please come back later. Thank you!", "Page temporarily unavailable. Please come back later. Thank you!", "O conteúdo desta página não está disponível temporariamente. Volte mais tarde. Obrigada.", "O conteúdo desta página não está disponível temporariamente. Volte mais tarde. Obrigada.", "该页面内容暂不可用，请稍后回来，谢谢！", "התוכן באתר זה אינו זמין באופן זמני. חזור שוב מאוחר יותר. תודה!", "Der Inhalt dieser Seite ist momentan nicht verfügbar. Bitte versuche es später noch einmal. Vielen Dank!", "Le contenu de cette page est temporairement indisponible.", "Revenez plus tard. Merci!", "La pagina non è al momento disponibile, riprova più tardi, grazie!"]
	var arr18 = ["شكراً، لقد انتهت هذه المشاركة بالفعل.", "Това участие е приключило вече, благодаря.", "Aquesta participació ja ha finalitzat, gràcies.", "Denne undersøgelse er allerede slut tak!", "Sie haben bereits an dieser Umfrage teilgenommen.", "Αυτή η συμμετοχή έχει ήδη ολοκληρωθεί, σας ευχαριστούμε.", "You already participated in this survey, thank you!", "Ya participaste en esta encuesta. ¡Gracias!", "Esta participación ya ha finalizado, gracias.", "Parte hartze hau amaitu da dagoeneko, eskerrik asko.", "Osallistumisesi on jo rekisteröity.", "Vous avez déjà participé à cette enquête. Merci!", "A túa participación rematou. Grazas", "השתתפת בסקר זה. תודה", "A részvétel már befejeződött, köszönjük.", "Hai già partecipato al sondaggio, grazie!", "参加受付はすでに締め切りました。ありがとうございます。", "You already participated in this survey, thank you!", "Această participare este deja finisată, vă mulţumesc.", "Deze deelname is reeds afgewerkt, dank u.", "Deze deelname is reeds afgewerkt, dank u.", "Denne deltakelsen er ferdig allerede", "Udział został zakończony, dziękujemy.", "Você já participou desta pesquisa. Obrigada!", "Você já participou deste inquérito. Obrigada!", "Această participare a luat sfârșit, vă mulțumim.", "Это исследование уже завершено, спасибо!", "Deltagandet har redan avslutats. Tack.", "การเข้าร่วมในครั้งนี้เสร็จเรียบร้อยแล้ว ขอบคุณ", "Bu katılım tamamlandı, teşekkürler.", "此次参与已经完成，谢谢。", "感谢您参与本次调查！"]
	var arr19 = ["مشاركة منتهية", "Приключило участие", "Participació finalitzada", "Undersøgelsen er gennemført", "Umfrage abgeschlossen", "Ολοκληρωμένη συμμετοχή", "Survey completed", "Encuesta finalizada", "Participación finalizada", "Encuesta finalizada", "Parte hartzea amaitua", "Osallistumisesi on rekisteröity.", "Enquête clôturée.", "Enquisa rematada.", "סקר הושלם", "A részvétel befejeződött", "Sondaggio completato", "参加受付終了", "Survey completed", "Participare finisată", "Afgewerkte deelname", "Afgewerkte deelname", "Ferdig deltakelse", "Zakończony udział", "Pesquisa finalizada.", "Inquérito finalizado.", "Participare încheiată", "Завершенное исследование", "Avslutat deltagande", "การเข้าร่วมเสร็จเรียบร้อยแล้ว", "Katılım tamamlandı", "完成参与", "完成问卷"]
	var arr20 = ["شكراً للإجابة على استطلاع الرأي.", "Благодаря за отговорите на  проучването.", "Gràcies per respondre l'enquesta.", "Tak fordi du valgte at deltage i spørgeundersøgelsen.", "Ihre Antworten wurden korrekt gespeichert. Vielen Dank für die Teilnahme.", "Σας ευχαριστούμε που απαντήσατε στην έρευνα.", "Your answers were saved correctly. Thanks for participating.", "Tus respuestas fueron guardadas correctamente. Gracias por participar.", "Gracias por contestar la encuesta.", "Tus respuestas fueron guardadas correctamente. Gracias por participar.", "Eskerrik asko inkesta erantzuteagatik.", "Kiitos tutkimukseen osallistumisesta.", "Vos réponses ont été correctement enregistrées. Merci pour votre participation.", "Grazas por participar na enquisa.", "תשובותיך ניצלו בצורה נכונה. תודה לך על השתתפותך.", "Köszönjük, hogy kitöltötte a kérdőívet.", "Le tue risposte sono state salvate correttamente. Grazie per aver partecipato", "アンケートにご回答いただきありがとうございます。", "Your answers were saved correctly. Thanks for participating.", "Vă mulţumim pentru că aţi răspuns la sondaj.", "Bedankt om de enquête in te vullen.", "Bedankt om de enquête in te vullen.", "Takk for besvarelsen", "Dziękujemy za wypełnienie ankiety.", "Suas respostas foram guardadas corretamente. Obrigada por participar.", "As suas respostas foram guardadas corretamente. Obrigada por participar.", "Vă mulțumim pentru că ați răspuns la sondaj.", "Спасибо за участие в опросе.", "Tack för att du har svarat på enkäten.", "ขอบคุณสำหรับการตอบแบบสำรวจ", "Anketi yanıtladığınız için teşekkürler.", "感谢填写调查问卷。", "您的回答已被正确保存，谢谢您的参与。"]

	/* Funcion de comprobacion de similitud */
	var descarte = 0;
	arr2.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr3.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr4.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr9.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr16.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr17.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr18.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr19.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	arr20.forEach(function (element) {
		console.log(mensaje.includes(element));
		if (mensaje.includes(element) == true) {
			descarte = 1;
		}
	});
	if (mensaje == "" || mensaje == undefined || mensaje == null) {
		descarte = 1;
	}

	console.log("Descarte: ", descarte);
	if (descarte == 0) {
		console.log("Se envia el mensaje");

		/* Calcular el tiempo del envio del email */
		var ahora = new Date();
		var d = ahora.getDate(); var y = ahora.getFullYear(); var m = ahora.getMonth();
		var s = ahora.getSeconds(); var min = ahora.getMinutes(); var h = ahora.getHours();
		var hora = h + ":" + min + ":" + s; hora = hora.toString();
		var fecha = d + "/" + m + "/" + y; fecha = fecha.toString();
		time = ahora.getTime();
		/* Fin de calculo del tiempo */

		var tempReceptor = receptor;
		tempReceptor = tempReceptor.split("@")[0];

		EnviarEmailGlobal(html, mensaje, asunto, receptor);
		/* Escribir datos */
		/*var databaseService = admin.database();
		var referencia = databaseService.ref('Emails/' + tempReceptor + "/" + time);

		referencia.set({
			mensaje: mensaje,
			asunto: asunto,
			receptor: tempReceptor,
			time: time,
			fecha: fecha,
			hora: hora,
			fechaEnvio: fe,
			horaEnvio: ho,
			tiempoEnvio: ti
		}).then(function () { // Se escribe el dato
			console.log('dato almacenado correctamente');
		}).catch(function (error) { // No se escribe el dato
			console.log('detectado un error', error);
		});*/
		
		let db = admin.firestore();

		let docRef = db.collection('Emails').doc();

		docRef.set({
			scripter: tempReceptor,
			mensaje: mensaje,
			asunto: asunto,
			receptor: tempReceptor,
			time: time,
			fecha: fecha,
			hora: hora
		}).then(function () { //Se escribe el dato 
			console.log('dato almacenado correctamente');
		}).catch(function (error) { // No se escribe el dato 
			console.log('detectado un error', error);
		});

		/* Fin */
		res.send(" Mensaje enviado");
	} else {
		res.send(" Mensaje fallido");
	}

});

/* Funcion para enviar el email */
function EnviarEmailGlobal(html, mensaje, asunto, receptor) {
	console.log("Creating transport...");
	let transporter = nodemailer.createTransport({
		service: 'gmail', //al usar un servicio bien conocido, no es necesario proveer un nombre de servidor.
		auth: {
			user: 'automatic.global.netquest@gmail.com',
			pass: 'AH;*fJ~0@]0Vs~|lC0zu'
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	let mailOptions = {
		from: 'automatic.global.netquest@gmail.com',
		to: receptor,
		subject: asunto,
		text: mensaje,
		html: html
	};
	console.log("sending email", mailOptions);
	transporter.sendMail(mailOptions, function (error, info) {
		console.log("senMail returned!");
		if (error) {
			console.log("Error: ", error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	console.log("End of Script");
}
