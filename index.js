const { Plugin } = require("powercord/entities");
const {
	// getModuleByDisplayName,
	getModule,
	i18n: { Messages }
} = require("powercord/webpack");
// const { inject, uninject } = require("powercord/injector");

powercord.api.i18n.loadAllStrings(require("./i18n"));

const statuses = {
	online: () => "🟢 " + Messages.STATUS_ONLINE,
	idle: () => "🌙 " + Messages.STATUS_IDLE,
	dnd: () => "⛔ " + Messages.STATUS_DND,
	streaming: () => "🟣 " + Messages.STATUS_STREAMING,
	invisible: () => "⚫ " + Messages.STATUS_INVISIBLE
};

const devices = {
	desktop: () => "🖥 " + Messages.SHOW_SESSIONS_DEVICE_DESKTOP,
	mobile: () => "📱 " + Messages.SHOW_SESSIONS_DEVICE_MOBILE,
	web: () => "🌐 " + Messages.SHOW_SESSIONS_DEVICE_WEB
};

const OSes = {
	windows: "🪟 Windows",
	linux: "🐧 Linux",
	macos: "🍎 MacOS",
	android: "🤖 Android",
	ios: "🍎 iOS"
};

function formatWithoutReact(i18nString, values) {
	return i18nString.message.replaceAll(/!!\{(.+?)\}!!/g, (_, name) => {
		if (values[name] === undefined)
			throw new Error("A value must be provided for " + name);
		return values[name];
	});
}

module.exports = class ShowSessions extends Plugin {
	async startPlugin() {
		this.sessionStore = await getModule(["getActiveSession"]);
		// const ConnectedUserAccountSettings = await getModuleByDisplayName(
		// 	"ConnectedUserAccountSettings"
		// );
		powercord.api.commands.registerCommand({
			command: "sessions",
			description: "Shows active sessions on your account",
			executor: this.command.bind(this)
		});
	}
	pluginWillUnload() {
		powercord.api.commands.unregisterCommand("sessions");
	}

	command() {
		const sessions = this.sessionStore.getSessions();
		const currentSession = this.sessionStore.getSession();
		return {
			send: false,
			result: {
				type: "rich",
				title:
					Object.keys(sessions).length > 0
						? Messages.SHOW_SESSIONS_SESSIONS
						: Messages.SHOW_SESSIONS_NO_SESSIONS,
				description:
					Object.keys(sessions).length > 0
						? ""
						: Messages.SHOW_SESSIONS_NO_SESSIONS_DESC,
				fields: Object.values(sessions)
					.filter(s => s.sessionId !== "all")
					.map((session, index) => ({
						name: Messages.SHOW_SESSIONS_SESSION_NUMERATED.format({
							num: "" + (index + 1)
						}),
						value: [
							`**ID:** \`${session.sessionId}\``,
							`**${Messages.SHOW_SESSIONS_STATUS}:** ${statuses[
								session.status
							]()}`,
							`**${Messages.SHOW_SESSIONS_DEVICE}:** ${
								devices[session.clientInfo.client]() ||
								"❓ " + Messages.SHOW_SESSIONS_UNKNOWN
							}`,
							`**OS:** ${
								OSes[session.clientInfo.os] ||
								"❓ " + Messages.SHOW_SESSIONS_UNKNOWN
							}`,
							session.activities.length > 0
								? `**${
										Messages.SHOW_SESSIONS_ACTIVITIES
								  }:** ${session.activities
										.map(activity => {
											switch (activity.type) {
												case 0:
													return `${activity.name}${
														activity.timestamps
															?.start
															? `, ${
																	Messages.SHOW_SESSIONS_SINCE
															  } <t:${activity.timestamps.start.slice(
																	0,
																	activity
																		.timestamps
																		.start
																		.length -
																		3
															  )}:R>`
															: ""
													}${
														activity.timestamps?.end
															? `, ${
																	Messages.SHOW_SESSIONS_ENDS
															  } <t:${activity.timestamps.end.slice(
																	0,
																	activity
																		.timestamps
																		.start
																		.length -
																		3
															  )}:R>`
															: ""
													}`;
												case 1:
													return `[${formatWithoutReact(
														Messages.STREAMING,
														{ name: activity.state }
													)}](${activity.url})`;
												case 2:
													return `${formatWithoutReact(
														MESSAGES.LISTENING_TO,
														{ name: activity.state }
													)}`;
												case 3:
													return `${formatWithoutReact(
														Messages.WATCHING,
														{ name: activity.state }
													)}`;
												case 4:
													return `${
														Messages.CUSTOM_STATUS
													}: ${
														activity.emoji?.name +
															" " || ""
													}${activity.state}`;
												case 5:
													return `${formatWithoutReact(
														Messages.COMPETING,
														{ name: activity.state }
													)}`;
											}
										})
										.join("\n    ")}`
								: false,
							session.sessionId === currentSession.sessionId
								? Messages.SHOW_SESSIONS_SESSION_CURRENT + " ✅"
								: false
						]
							.filter(r => r)
							.join("\n"),
						inline: true
					}))
			}
		};
	}
};
