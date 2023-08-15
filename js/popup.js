document.addEventListener("DOMContentLoaded", function () {
  const intervalInput = document.getElementById("interval");
  const saveButton = document.getElementById("saveButton");
  const testButton = document.getElementById("testButton");
  const lastSavedIntervalElement = document.getElementById("lastSavedInterval");
  const timerElement = document.getElementById("timer");

  // Restore saved interval value from storage
  chrome.storage.sync.get(["interval", "lastSavedTime"], function (data) {
    if (data.interval) {
      intervalInput.value = data.interval;
    }
    if (data.lastSavedTime) {
      displayLastSavedTime(data.lastSavedTime);
    }
    updateTimer(data.interval, data.lastSavedTime);
  });

  // Save the new interval when "Save" button is clicked
  saveButton.addEventListener("click", function () {
    const newInterval = parseInt(intervalInput.value, 10);
    chrome.storage.sync.set({ interval: newInterval, lastSavedTime: Date.now() }, function () {
      // Notify background script to update the alarm
      chrome.runtime.sendMessage({ updateAlarm: true });
      displayLastSavedTime(Date.now());
      updateTimer(newInterval, Date.now());
    });
  });

  // Test the reminder when "Test Reminder" button is clicked
  testButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ testReminder: true });
  });

  function displayLastSavedTime(timestamp) {
    const now = Date.now();
    const timeElapsed = Math.floor((now - timestamp) / (1000 * 60)); // Calculate elapsed minutes
    lastSavedIntervalElement.textContent = timeElapsed;
  }

  let timerInterval = null;

  function updateTimer(interval, lastSavedTime) {
    if (!interval || !lastSavedTime) {
      return;
    }
    const now = Date.now();
    const timeElapsed = now - lastSavedTime;
    const timeRemaining = interval * 60 * 1000 - timeElapsed; // Convert interval to milliseconds
    updateTimerDisplay(timeRemaining);

    // Clear the previous timer interval to prevent multiple intervals running
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Update the timer every second until it reaches zero
    timerInterval = setInterval(function () {
      const remaining = timeRemaining - Date.now() + now;
      if (remaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        updateTimerDisplay(0);
      } else {
        updateTimerDisplay(remaining);
      }
    }, 1000);
  }



  function updateTimerDisplay(timeRemaining) {
    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    const displayMinutes = String(minutes).padStart(2, "0");
    const displaySeconds = String(seconds).padStart(2, "0");
    timerElement.textContent = `${displayMinutes}:${displaySeconds}`;
  }
});
