let reminderInterval = 60; // Default reminder interval in minutes

// Load the reminder interval from storage if available
chrome.storage.sync.get("interval", function (data) {
  if (data.interval) {
    reminderInterval = data.interval;
  }
  // Create the alarm with the loaded or default interval
  createAlarm();
});

function createAlarm() {
  // Clear any existing alarm with the same name
  chrome.alarms.clear("hydrateAlarm");
  // Create a new alarm with the updated interval
  chrome.alarms.create("hydrateAlarm", { delayInMinutes: reminderInterval, periodInMinutes: reminderInterval });
}

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "hydrateAlarm") {
    showNotification();
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.updateAlarm) {
    // Update the reminder interval and create the alarm
    chrome.storage.sync.get("interval", function (data) {
      if (data.interval) {
        reminderInterval = data.interval;
        createAlarm();
      }
    });
  } else if (message.testReminder) {
    // Trigger a test reminder immediately
    showNotification();
  }
});

function showNotification() {
  const options = {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "H2O Reminder",
    message: "It's time to drink some water!",
  };

  chrome.notifications.create(options);
}
