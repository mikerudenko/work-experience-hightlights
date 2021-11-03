import { initNotificationSocket } from './Header/scenes/NotificationWidget/modules/notifications.sockets';
import { sockedUploadUpdateListener, sockedUploadDeleteListener } from './VocStore/scenes/UploadsList/modules/uploadList.sockets';
import { sockedUploadCreateListener } from './VocStore/scenes/UploadData/modules/uploadData.sockets';

import { initCountersSocket } from './Header/scenes/VocMenu/modules/counter.sockets';
import { initMineQuerySocket } from './Header/scenes/VocMenu/modules/mineQueries.sockets';

export const socketsListeners = [
    initNotificationSocket,
    sockedUploadDeleteListener,
    sockedUploadCreateListener,
    sockedUploadUpdateListener,
    initCountersSocket,
    initMineQuerySocket
];
