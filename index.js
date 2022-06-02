const { Plugin } = require("powercord/entities");
const {
	getModuleByDisplayName,
	getModule,
	i18n: { Messages },
	React,
	FluxDispatcher
} = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { wrapInHooks } = require("powercord/util");
const SessionList = require("./components/SessionList");
const { STATUS, DEVICE, OS } = require("./constants");

powercord.api.i18n.loadAllStrings(require("./i18n"));

function formatWithoutReact(i18nString, values) {
	return i18nString.message.replaceAll(/!!\{(.+?)\}!!/g, (_, name) => {
		if (values[name] === undefined)
			throw new Error("A value must be provided for " + name);
		return values[name];
	});
}

module.exports = class ShowSessions extends Plugin {
	async startPlugin() {
		this.loadStylesheet("style.css");
		this.sessionStore = await getModule(["getActiveSession"]);

		powercord.api.commands.registerCommand({
			command: "sessions",
			description: "Shows active sessions on your account",
			executor: this.command.bind(this)
		});

		let ConnectedUserAccountSettings;
		while (typeof ConnectedUserAccountSettings !== "function") {
			ConnectedUserAccountSettings = await getModuleByDisplayName(
				"ConnectedUserAccountSettings"
			);
			await new Promise(resolve => setTimeout(resolve, 1e4));
		}

		const UserSettingsAccount = wrapInHooks(
			() => ConnectedUserAccountSettings().type
		)();

		inject(
			"show-sessions_account-settings",
			UserSettingsAccount.prototype,
			"render",
			(_, res) => {
				res.props.children[2].props.children.splice(
					1,
					0,
					React.createElement(SessionList, {})
				);
				return res;
			}
		);
	}
	pluginWillUnload() {
		uninject("show-sessions_account-settings");
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
							num: index + 1
						}),
						value: [
							`**ID:** \`${session.sessionId}\``,
							`**${Messages.SHOW_SESSIONS_STATUS}:** ${STATUS[
								session.status
							]()}`,
							`**${Messages.SHOW_SESSIONS_DEVICE}:** ${
								DEVICE[session.clientInfo.client]() ||
								"❓ " + Messages.SHOW_SESSIONS_UNKNOWN
							}`,
							`**${Messages.SHOW_SESSIONS_OS}:** ${
								OS[session.clientInfo.os] ||
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
														Messages.LISTENING_TO,
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
														activity.emoji?.id
															? `<${
																	activity
																		.emoji
																		.animated
																		? "a"
																		: ""
															  }:${
																	activity
																		.emoji
																		.name
															  }:${
																	activity
																		.emoji
																		.id
															  }>`
															: `${activity.emoji?.name ?? ""} ` || ""
													}${activity.state || ""}`;
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
								? Messages.SHOW_SESSIONS_CURRENT_SESSION + " ✅"
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
