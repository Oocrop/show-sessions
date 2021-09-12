const {
	React,
	getModule,
	getModuleByDisplayName,
	Flux: { connectStores },
	i18n: { Messages },
	constants: {
		Colors: { STATUS_GREEN_600 }
	}
} = require("powercord/webpack");
const { AsyncComponent } = require("powercord/components");
const { DEVICE, OS } = require("../constants");

module.exports = AsyncComponent.from(
	(async () => {
		const { getCurrentUser } = await getModule(["getCurrentUser"]);
		const sessionStore = await getModule(["getActiveSession"]);
		const { FormSection, FormDivider } = await getModule(["FormSection"]);
		const { default: Avatar } = await getModule(["AnimatedAvatar"]);
		const UserActivityContainer = await getModuleByDisplayName(
			"UserActivityContainer"
		);
		const CustomStatus = await getModuleByDisplayName("CustomStatus");
		const { TextBadge } = await getModule(["TextBadge"]);
		const { parse } = await getModule(["parse", "parseTopic"]);
		const { marginTop40 } = await getModule(["marginTop40"]);
		const { card, title } = await getModule(["card", "loaded"]);
		const { colorStandard } = await getModule(["colorStandard"]);
		const {
			customStatus,
			customStatusEmoji,
			customStatusSoloEmoji,
			customStatusText
		} = await getModule(["customStatus", "customStatusEmoji"]);

		class SessionList extends React.Component {
			render() {
				const sessions = sessionStore.getSessions();
				const currentSession = sessionStore.getSession();
				return (
					<>
						<FormSection
							title={Messages.SHOW_SESSIONS_SESSIONS}
							tag="h1"
							className={marginTop40}
						>
							<div className="sessionsGrid">
								{Object.values(sessions)
									.filter(s => s.sessionId !== "all")
									.map((session, index) =>
										this.renderItem(
											session,
											index,
											session.sessionId ===
												currentSession.sessionId
										)
									)}
							</div>
						</FormSection>
						<FormDivider className={marginTop40} />
					</>
				);
			}

			renderItem(session, index, current) {
				const currentUser = getCurrentUser();
				return (
					<div className={`${card} ${colorStandard} sessionCard`}>
						<div className="sessionCard-header">
							<h1 className={`${title} sessionCard-title`}>
								{Messages.SHOW_SESSIONS_SESSION_NUMERATED.format(
									{ num: index + 1 }
								)}
								{current ? (
									<TextBadge
										color={STATUS_GREEN_600}
										text={
											Messages.SHOW_SESSIONS_CURRENT_SESSION
										}
									/>
								) : null}
							</h1>
							<Avatar
								src={currentUser.getAvatarURL()}
								size="SIZE_32"
								status={session.status}
							/>
						</div>
						{session.activities.length > 0 ? (
							<>
								<FormSection
									title={Messages.SHOW_SESSIONS_ACTIVITIES}
								>
									{session.activities.map(activity => (
										<div className="sessionCard-activity">
											{activity.type === 4 ? (
												<CustomStatus
													activity={activity}
													className={customStatus}
													emojiClassName={
														customStatusEmoji
													}
													soloEmojiClassName={
														customStatusSoloEmoji
													}
													textClassName={
														customStatusText
													}
												/>
											) : (
												<UserActivityContainer
													activity={activity}
													type="Profile"
													user={currentUser}
												/>
											)}
										</div>
									))}
								</FormSection>
								<FormDivider />
							</>
						) : null}
						<div>
							{[
								`**ID**: \`${session.sessionId}\``,
								`**${Messages.SHOW_SESSIONS_DEVICE}**: ${DEVICE[
									session.clientInfo.client
								]()}`,
								`**${Messages.SHOW_SESSIONS_OS}**: ${
									OS[session.clientInfo.os]
								}`
							].map(s => (
								<>
									{parse(s)}
									<br />
								</>
							))}
						</div>
					</div>
				);
			}
		}

		return connectStores([sessionStore], () => ({}))(SessionList);
	})()
);
