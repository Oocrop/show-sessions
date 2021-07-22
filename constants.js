const {
	i18n: { Messages }
} = require("powercord/webpack");

const STATUS = {
	online: () => "🟢 " + Messages.STATUS_ONLINE,
	idle: () => "🌙 " + Messages.STATUS_IDLE,
	dnd: () => "⛔ " + Messages.STATUS_DND,
	streaming: () => "🟣 " + Messages.STATUS_STREAMING,
	invisible: () => "⚫ " + Messages.STATUS_INVISIBLE
};

const DEVICE = {
	desktop: () => "🖥 " + Messages.SHOW_SESSIONS_DEVICE_DESKTOP,
	mobile: () => "📱 " + Messages.SHOW_SESSIONS_DEVICE_MOBILE,
	web: () => "🌐 " + Messages.SHOW_SESSIONS_DEVICE_WEB
};

const OS = {
	windows: "🪟 Windows",
	linux: "🐧 Linux",
	macos: "🍎 MacOS",
	android: "🤖 Android",
	ios: "🍎 iOS"
};

module.exports = { STATUS, DEVICE, OS };
