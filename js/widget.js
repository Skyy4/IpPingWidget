class IpPingWidget extends Widget 
{
	constructor(id, app) 
	{
		super(id, IpPingModel, IpPingView, IpPingController, app);
	}
	
	setUp() {
		super.setUp();
		this.header = true;
		this.footer = true;
	}
	
	async ready() {
		super.ready();
		/*SocketIO.initialize();
		SocketIO.on("msg", this.mvc.controller.onMessage.bind(this));*/
	}
	
}

class IpPingModel extends WidgetModel 
{
	constructor() { super(); }
	
	setUp() { super.setUp(); }

	/**
	* Retourne true si l'ip saisie est conforme
	* @param ip : ip à tester
	*/
	CheckIp(ip)
	{
		var reg = /^((?:(https?):\/\/)?((?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9]))|(?:(?:(?:\w+\.){1,2}[\w]{2,3})))(?::(\d+))?((?:\/[\w]+)*)(?:\/|(\/[\w]+\.[\w]{3,4})|(\?(?:([\w]+=[\w]+)&)*([\w]+=[\w]+))?|\?(?:(wsdl|wadl))))$/.exec(ip);

		if (reg)
			return true;
		else
			return false;
	}

	/**
	* Retourne le ping obtenu selon l'ip
	* @param ip : ip à tester
	*/
	async GetPing(ip)
	{
		let result = await this.try.mvc.main.dom("https://node.nicopr.fr/dash/ping/ping/" + ip); // load web page
		let domstr = _atob(result.response.dom); // decode result

		var ping = /\d+(?:.\d+)?\s?ms/.exec(domstr);
		
		if (ping)
			return ping[0];
		else
			return "erreur";
	}
}

class IpPingView extends WidgetView 
{
	constructor() { super(); }
	
	setUp() { super.setUp(); }

	draw() 
	{
		super.draw();

		//label
		this.try.pingContainer = HH.create("div");
		SS.style(this.try.pingContainer, {"paddingTop": "10px", "width": "100%", "height": "40%", "lineHeight": "calc(100%)", "textAlign": "center", "fontSize": "35px"});
		this.try.stage.appendChild(this.try.pingContainer);

		//input
		this.try.ipContainer = HH.create("input");
		this.try.ipContainer.setAttribute("type", "text");
		this.try.ipContainer.setAttribute("value", "127.0.0.1");
		SS.style(this.try.ipContainer, {"width": "100%", "height": "17%", "textAlign": "center", "fontSize": "14px"});
		this.try.ipContainer.innerHTML = 0;
		this.try.stage.appendChild(this.try.ipContainer);

		//button
		this.try.footer.innerHTML = "TEST PING";
		SS.style(this.try.footer, {"fontSize": "16px", "userSelect": "none", "cursor": "pointer"});
		Events.on(this.try.footer, "click", event => this.try.mvc.controller.CheckIp(this.try.ipContainer.value));
		this.try.stage.appendChild(this.try.footer);
	}
	
	/**
	* Affiche le ping sur @pingContainer
	* @param ping : ping obtenu
	*/
	update(ping) { this.pingContainer.innerHTML = ping; }

	/**
	* Informe l'utilisateur que le ping est en cours d'obtention
	*/
	loading() { this.pingContainer.innerHTML = "..."; }
}

class IpPingController extends WidgetController 
{
	constructor() { super(); }
	
	setUp() { super.setUp(); }

	/* Variable qui évite de faire plusieurs demande de ping */
	GetPingEnabled = true;

	/**
	* Si l'ip est conforme on lance @GetPing
	* @param ip : ip à tester
	*/
	CheckIp(ip)
	{
		if (this.GetPingEnabled)
		{
			this.GetPingEnabled = false; // bloque les tests de pings

			let result = this.mvc.model.CheckIp(ip);

			if (result)
				this.GetPing(ip);
			else
			{
				alert("La saisie n'est pas conforme.");
				this.GetPingEnabled = true; // débloque les tests de pings
			}
		}	
	}

	/**
	* Récupère le ping obtenu depuis @GetPingModel puis appel la méthode @update
	* @param ip : ip à tester
	*/
	async GetPing(ip) 
	{
		this.mvc.view.loading(); //loading view

		let result = await this.try.mvc.model.GetPing(ip);

		this.mvc.view.update(result);

		this.GetPingEnabled = true; // débloque les tests de pings
	}
}