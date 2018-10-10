/**
 * The preload script needs to stay in regular ole JavaScript, because it is
 * the point of entry for electron-compile.
 */

const allowedChildWindowEventMethod = [
    'windowWithTokenBeganLoading',
    'windowWithTokenFinishedLoading',
    'windowWithTokenCrashed',
    'windowWithTokenDidChangeGeometry',
    'windowWithTokenBecameKey',
    'windowWithTokenResignedKey',
    'windowWithTokenWillClose'
];

if (window.location.href !== 'about:blank') {
    const preloadStartTime = process.hrtime();

    require('./assign-metadata').assignMetadata();
    if (window.parentWebContentsId) {
        //tslint:disable-next-line:no-console max-line-length
        const warn = () => console.warn(`Deprecated: direct access to global object 'parentInfo' will be disallowed. 'parentWebContentsId' will be available until new interface is ready.`);
        Object.defineProperty(window, 'parentInfo', {
            get: () => {
                warn();
                return {
                    get webContentsId() {
                        warn();
                        return parentWebContentsId;
                    }
                };
            }
        });
    }

    const { ipcRenderer, remote } = require('electron');

    ipcRenderer
        .on('SLACK_NOTIFY_CHILD_WINDOW_EVENT', (event, method, ...args) => {
            try {
                if (!TSSSB || !TSSSB[method]) throw new Error('Webapp is not fully loaded to execute method');
                if (!allowedChildWindowEventMethod.includes(method)) {
                    throw new Error('Unsupported method');
                }

                TSSSB[method](...args);
            } catch (error) {
                console.error(`Cannot execute method`, { error, method }); //tslint:disable-line:no-console
            }
        });

    ipcRenderer
        .on('SLACK_REMOTE_DISPATCH_EVENT', (event, data, origin, browserWindowId) => {
            const evt = new Event('message');
            evt.data = JSON.parse(data);
            evt.origin = origin;
            evt.source = {
                postMessage: (message) => {
                    if (!desktop || !desktop.window || !desktop.window.postMessage) throw new Error('desktop not ready');
                    return desktop.window.postMessage(message, browserWindowId);
                }
            };

            window.dispatchEvent(evt);
            event.sender.send('SLACK_REMOTE_DISPATCH_EVENT');
        });

    const { init } = require('electron-compile');
    const { assignIn } = require('lodash');
    const path = require('path');

    const { isPrebuilt } = require('../utils/process-helpers');

    //tslint:disable-next-line:no-console
    process.on('uncaughtException', (e) => console.error(e));

    /**
     * Patch Node.js globals back in, refer to
     * https://electron.atom.io/docs/api/process/#event-loaded.
     */
    const processRef = window.process;
    process.once('loaded', () => {
        window.process = processRef;
    });

    window.perfTimer.PRELOAD_STARTED = preloadStartTime;

    // Consider "initial team booted" as whether the workspace is the first loaded after Slack launches
    ipcRenderer.once('SLACK_PRQ_TEAM_BOOT_ORDER', (_event, order) => {
        window.perfTimer.isInitialTeamBooted = order === 1;
    });
    ipcRenderer.send('SLACK_PRQ_TEAM_BOOTED'); // Main process will respond SLACK_PRQ_TEAM_BOOT_ORDER

    const resourcePath = path.join(__dirname, '..', '..');
    const mainModule = require.resolve('../ssb/main.ts');
    const isDevMode = loadSettings.devMode && isPrebuilt();

    init(resourcePath, mainModule, !isDevMode);
}




// Slack Theme Nightfall
// ########################

document.addEventListener("DOMContentLoaded", function() {

    // Then get its webviews
    let webviews = document.querySelectorAll(".TeamView webview");

    // Fetch our CSS in parallel ahead of time
    const cssPath = 'https://raw.githubusercontent.com/jamujr/slack-theme-nightfall/master/nightfall-base.css';
    let cssPromise = fetch(cssPath).then(response => response.text());

    let customCustomCSS = `
:root {
/* Modify these to change your theme colors: */
--primary: #61AFEF;
--text: white;
--backgroundjme: #2c2d30;
}
body {
background: #222; color: #e6e6e6;
font-family:'Nunito',sans-serif!important;
src:url(https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i);
text-rendering:optimizeLegibility important;
font-weight:500!important
}

.c-message__body {
color:#aaabac;
font-size:18px
}

pre,pre.c-mrkdwn__pre {
font-weight:600!important
}

code,pre,pre.c-mrkdwn__pre {
font-family:"Source Code Pro",Monaco,Menlo,Consolas,"Courier New",monospace!important
}

pre {
color:#aaabac;
background:#292929;
font-size:.85rem
}

code,pre.c-mrkdwn__pre {
font-size:1.1rem
}

pre.c-mrkdwn__pre {
line-height:1.4rem
}

code {
color:#aaabac;
background:#292929
}

.c-message--light .c-message__sender .c-message__sender_link {
color:#8a8f94
}

.c-mrkdwn__broadcast--mention,.c-mrkdwn__broadcast--mention:hover,.c-mrkdwn__highlight,.c-mrkdwn__mention,.c-mrkdwn__mention:hover {
background:#363636;
border:1px solid #545454
}

.c-mrkdwn__user_group--mention,.c-mrkdwn__user_group--mention:hover {
background:#363636;
border:1px solid #545454;
color:#e6e6e6
}

.c-mrkdwn__broadcast--mention,.c-mrkdwn__broadcast--mention:hover,.c-mrkdwn__highlight,.c-mrkdwn__mention,.c-mrkdwn__mention:hover,.c-mrkdwn__subteam--mention,.c-mrkdwn__subteam--mention:hover,.mention_yellow_bg {
color:#d68336!important
}

.c-member_slug--link,.c-mrkdwn__subteam--link,a.c-member_slug {
background:#363636;
border:1px solid #545454;
color:#e6e6e6
}

#msg_form #msg_input {
background:padding-box #2d2e2e;
border-color:#424242;
border-left:0;
color:#e6e6e6;
font-size:20px
}

a:link {
color:#488eb7
}

a:active,a:focus,a:hover {
color:#06547c
}

.channel_header_icon {
color:#717274
}

.c-message_list__day_divider__label {
color:#3c9455
}

.c-message_list__day_divider__line {
border-top-color:#3c9455
}

#primary_file_button {
background:padding-box #545454;
border:2px solid #3c9455!important;
background:#3c9455!important;
color:#fff!important
}

#primary_file_button:hover {
border:2px solid #006039!important;
background:#006039!important
}

.p-notification_bar__formatting b,.p-notification_bar__formatting code,.p-notification_bar__formatting i,.p-notification_bar__formatting span {
margin-right:9px;
color:#41b5f1
}

.p-channel_sidebar__channel--unread:not(.p-channel_sidebar__channel--muted):not(.p-channel_sidebar__channel--selected) .p-channel_sidebar__name,.p-channel_sidebar__link--invites:not(.p-channel_sidebar__link--dim) .p-channel_sidebar__name,.p-channel_sidebar__link--unread .p-channel_sidebar__name,.p-channel_sidebar__quickswitcher:hover,.p-channel_sidebar__section_heading_label--clickable:hover {
color:#f5bb70!important
}

.channel_title .channel_name button {
color:#949494
}

[lang] .c-message_attachment__body {
line-height:1.15;
}

.c-button--outline {
background:#363636;
box-shadow:inset 0 0 0 1px rgba(44,45,48,.3);
color:#2c2d30;
font-weight:700;
transition:all 75ms ease-in-out;
border:1px solid #545454
}

.c-button--outline:link,.c-button--outline:visited {
color:#488eb7
}

.c-button--outline:link:hover,.c-button--outline:visited:hover {
color:#06547c;
border:1px solid #717171
}

.c-message_attachment__field_title {
font-weight:900;
color:#3076ab
}

.c-message_attachment__field {
margin-bottom: 2px;
}

.c-virtual_list__item:hover,.c-virtual_list__sticky_container:hover {
background:#1f1f1f
}

.ql-placeholder,.texty_legacy .ql-placeholder {
color:#2b2d2d;
filter:none
}

.c-dialog__body {
color:#2d2d2d
}

.c-button--outline {
background:#eaeaea
}

.modal-backdrop,.modal-backdrop.fade.in {
opacity:.7
}

.modal {
width:70%;
box-shadow:0 10px 30px #000
}

.c-message--light .c-message__gutter,.c-message--light .c-message__label__gutter {
padding-right:8px;
width:58px
}

.c-message--light .c-message__content {
margin-left:58px
}

.c-timestamp__label {
font-size:10px
}

.p-file_details__name {
color:#adadad
}

.p-flexpane_header {
background:#151515
}

.p-channel_sidebar__channel,.p-channel_sidebar__folder_heading,.p-channel_sidebar__link,.p-channel_sidebar__section_heading {
padding:0 12px 0 7px
}

.ql-container.texty_single_line_input {
background:#eaeaea
}

#team_tab #member_preview_scroller .feature_custom_status_expiry.member_details .member_name {
color:#eaeaea
}

ts-jumper .p-jumper__help {
background:#292929
}

.p-notification_bar__typing {
color:#f5bb70!important
}
.ql-container.texty_single_line_input {
color: #777;
}
.c-input_select {
background: #ffffff;
}
.c-message--standalone {
border-color: rgba(197, 197, 197, 1);
}
.ql-placeholder, .texty_legacy .ql-placeholder {
    color: #828282;
}
#client_body:not(.onboarding):not(.feature_global_nav_layout):before {
    box-shadow: inset 0 0 0 0 #e8e8e8;
}

    `

    // Insert a style tag into the wrapper view
    cssPromise.then(css => {
        let s = document.createElement('style');
        s.type = 'text/css';
        s.innerHTML = css + customCustomCSS;
        document.head.appendChild(s);
    });

    // Wait for each webview to load
    webviews.forEach(webview => {
        webview.addEventListener('ipc-message', message => {
            if (message.channel == 'didFinishLoading')
            // Finally add the CSS into the webview
                cssPromise.then(css => {
                let script = `
let s = document.createElement('style');
s.type = 'text/css';
s.id = 'slack-custom-css';
s.innerHTML = \`${css + customCustomCSS}\`;
document.head.appendChild(s);
`
                webview.executeJavaScript(script);
            })
        });
    });
});
