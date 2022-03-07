// adds to the UIs a menu with some extra tools of ours ;)
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('General Menu')
    .addItem('Reset All Content', 'resetButton')
    .addItem('Clear Notes', 'clearButton')
    .addSeparator()
    .addItem("Update Name of Current Sheet", "changeDate")
    .addSeparator()
    .addItem("Instructions", "instructionsButton")
    .addItem("Important Notes", "importantButton")
    .addToUi();
}

// changes date of sheet to current date (preserving "Student In" if it's present in the sheet)
function changeDate() {
  // i find this...
  if (SpreadsheetApp.getActiveSheet().getName().includes("Student In")) {
    return
  }
  var now = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  now = now.split(", ")[0]

  // no point to fetching ss here
  ss = SpreadsheetApp.getActiveSpreadsheet().getSheets()
  // and this starting if statement highly redundant
  if (SpreadsheetApp.getActiveSheet().getName().includes("Student In")) {
    SpreadsheetApp.getActiveSheet().setName(`${now}${" Student In"}`)
  } else {
    SpreadsheetApp.getActiveSheet().setName(now)
  }
}

function instructionsButton() {
  SpreadsheetApp.getUi().alert(`When you are signing someone out, click the corresponding checkbox in the "Teacher Initial" column, and the date/time will automatically generate in the column directly to the right.

If you mistakenly checked the box, just uncheck it and the timestamp will remove itself automatically

To reset all the checkboxes in the "Teacher Initial" column, press the "RESET ALL" button at the top

READ IMPORTANT NOTES
`)
}

function importantButton() {
  SpreadsheetApp.getUi().alert(`1. The system may take a few seconds to respond, please be patient.

2. Don't do anything too fast. If the checkboxes do not give a response on use, wait for a while and then try doing it again.

3. If anyone removes a timestamp on accident, hover over the cell in the Time column to find the last time inputted, and copy paste that back into the column as is.

Credits to Archit Agarwal and Pranesh Saran`)
}

function clearButton() {
  if (SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName().includes("Student In")) {
    return
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheets()
  var clearButton = SpreadsheetApp.getUi().alert("Confirmation", "Are you sure you want to reset all the notes? (This action is irreversible, as it removes all backups of removed timestamps)", SpreadsheetApp.getUi().ButtonSet.YES_NO);
  //uncheck the reset box no matter whether they say yes or no (so that they can use it again later without having to uncheck)
  // e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('clear_box')).getRange().uncheck();
  if (clearButton == SpreadsheetApp.getUi().Button.YES) {
    for (let current of ss) {
      //clear all notes
      //e.range.getSheet().getRange("A5:U").clearNote();
      current.getNamedRanges().find(bean => bean.getName().endsWith('in_timestamps')).getRange().clearNote();
      current.getNamedRanges().find(bean => bean.getName().endsWith('out_timestamps')).getRange().clearNote();
      current.getNamedRanges().find(bean => bean.getName().endsWith('second_other_column')).getRange().clearNote();
      //gets the date and converts it from UTC to our timezone (US/Pacific)
      var now = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
      current.getNamedRanges().find(bean => bean.getName().endsWith('clear_box')).getRange().setNote(`Last note reset: ${now}`);
    }
  }
}

function resetButton() {
  if (SpreadsheetApp.getActiveSheet().getName().includes("Student In")) {
    return
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var destructionisforevar = SpreadsheetApp.getUi().alert("Confirmation", "Are you sure you want to reset all the timestamps? (This action is partially irreversible, as you can use notes to replace removed timestamps)", SpreadsheetApp.getUi().ButtonSet.YES_NO);
  // uncheck the reset box no matter whether they say yes or no (so that they can use it again later without having to uncheck)
  // e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('reset_box')).getRange().uncheck();

  //if they said yes...
  if (destructionisforevar == SpreadsheetApp.getUi().Button.YES) {
    for (let current of ss) {
      if (!current.getName().includes("Student In")) {
        // SpreadsheetApp.getUi().alert(`${current}`);
        //gets the ldate and converts it from UTC to our timezone (US/Pacific)
        var now = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
        // set a note on the reset button detailing the last reset
        current.getNamedRanges().find(bean => bean.getName().endsWith("reset_box")).getRange().setNote(`Last reset: ${now}`);
        // uncheck all checkboxes in the "Time In" and "Time Out" columns
        current.getNamedRanges().find(bean => bean.getName().includes("student_in")).getRange().uncheck()
        current.getNamedRanges().find(bean => bean.getName().includes("student_out")).getRange().uncheck()
        // student_in.uncheck();
        // student_out.uncheck();
        current.getRange('H5:L').uncheck();
        current.getRange('H5:L5').uncheck();

        // fetch the timestamps and clear them (NOT the notes, however, just in case the reset was an accident)
        current.getNamedRanges().find(nrange => nrange.getName().endsWith('in_timestamps')).getRange().clearContent();
        current.getNamedRanges().find(nrange => nrange.getName().endsWith('out_timestamps')).getRange().clearContent();
        current.getNamedRanges().find(nrange => nrange.getName().includes('other_column')).getRange().clearContent();
        current.getNamedRanges().find(nrange => nrange.getName().endsWith('second_other_column')).getRange().clearContent();
      }
    }
  }
}

//BULLETIN BOARD:

// - make it so that you can read from the notes and add to the cells with a checkbox
// - map all special checkboxes (like reset and read notes) to a list, check if it's in a dictionary, and run a function that's listed in the dictionary's end

//every time someone edits the spreadsheet, this function is called
function onEdit(e) {
  //"e" is a variable that is comprised of the range (cell or cells) that was edited

  //if the function is run through the script instead of on a trigger, ignore
  if (!e) return; 
  
  //get the location of the changed cell
  var loc = e.range.getA1Notation();
  //split the location into letter and number
  var letter = loc.substr(0, 1);
  var number = loc.substr(1);

  //get the checkboxes in the "Time In" and "Time Out" column
  var student_in = e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('student_in')).getRange();
  var student_out = e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('student_out')).getRange(); 
  //get the column of the checkboxes in the "Teacher Initial" column
  var student_in_col = student_in.getA1Notation().substr(0, 1);  //var life = bobitto; life.substr(1, 2) > ob "5"
  var student_out_col = student_out.getA1Notation().substr(0, 1);
  //gets the date and converts it from UTC to our timezone (US/Pacific)
  var now = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

  //if the user checked the "clear notes" box
  if (loc == e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('clear_box')).getRange().getA1Notation() && e.range.isChecked()) {
    //confirm that they want to reset
    var clearButton = SpreadsheetApp.getUi().alert("Confirmation", "Are you sure you want to reset all the notes? (This action is irreversible, as it removes all backups of removed timestamps)", SpreadsheetApp.getUi().ButtonSet.YES_NO);
    //uncheck the reset box no matter whether they say yes or no (so that they can use it again later without having to uncheck)
    e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('clear_box')).getRange().uncheck();
    if (clearButton == SpreadsheetApp.getUi().Button.YES) {
      //clear all notes
      //e.range.getSheet().getRange("A5:U").clearNote();
      e.range.getSheet().getNamedRanges().find(bean => bean.getName().endsWith('in_timestamps')).getRange().clearNote();
      e.range.getSheet().getNamedRanges().find(bean => bean.getName().endsWith('out_timestamps')).getRange().clearNote();
      e.range.getSheet().getNamedRanges().find(bean => bean.getName().endsWith('clear_box')).getRange().setNote(`Last note reset: ${now}`);
    }
  //if the user checked the reset button...
  } else if (loc == e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('reset_box')).getRange().getA1Notation() && e.range.isChecked()) {
    //confirm that they want to reset
    var destructionisforevar = SpreadsheetApp.getUi().alert("Confirmation", "Are you sure you want to reset all the timestamps? (This action is partially irreversible, as you can use notes to replace removed timestamps)", SpreadsheetApp.getUi().ButtonSet.YES_NO);
    //uncheck the reset box no matter whether they say yes or no (so that they can use it again later without having to uncheck)
    e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('reset_box')).getRange().uncheck();

    //if they said yes...
    if (destructionisforevar == SpreadsheetApp.getUi().Button.YES) {
      // set a note on the reset button detailing the last reset
      e.range.getSheet().getNamedRanges().find(bean => bean.getName().endsWith("reset_box")).getRange().setNote(`Last reset: ${now}`);
      // uncheck all checkboxes in the "Time In" and "Time Out" columns
      student_in.uncheck();
      student_out.uncheck();
      e.range.getSheet().getRange('H5:L').uncheck();
      e.range.getSheet().getRange('H5:L5').uncheck();

      // fetch the timestamps and clear them (NOT the notes, however, just in case the reset was an accident)
      e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('in_timestamps')).getRange().clearContent();
      e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('out_timestamps')).getRange().clearContent();
      e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('other_column')).getRange().clearContent();
      e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith('second_other_column')).getRange().clearContent();
    }
  } else if (SpreadsheetApp.getActiveSheet().getName().includes("Student In") && letter == student_in_col) {
    //if the checkbox was checked...
    var timestamps = e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith(`${(letter == student_in_col ? 'in' : 'out')}_timestamps`)).getRange();
    var timestampsLocCol = timestamps.getA1Notation().substr(0, 1);
    var timestampsLocRow = e.range.getA1Notation().substr(1);
    ss = SpreadsheetApp.getActiveSpreadsheet().getSheets()

    if (e.range.isChecked()) {
      //add a timestamp and set a note of the last timestamp added, in case the box was unchecked on accident
      ss.find(bean => bean.getName() == now.split(", ")[0]).getRange(`${timestampsLocCol}${timestampsLocRow}`).setValue(now).setNote(`Last edit: ${now}`);
    //if the checkbox was unchecked...
    } else {
      //remove the timestamp, but keep the note in case the box was unchecked on accident
      ss.find(bean => bean.getName() == now.split(", ")[0]).getRange(`${timestampsLocCol}${timestampsLocRow}`).setValue('');
    }
  } else if (letter == student_in_col || letter == student_out_col) {
    //if the checkbox was checked...
    var timestamps = e.range.getSheet().getNamedRanges().find(nrange => nrange.getName().endsWith(`${(letter == student_in_col ? 'in' : 'out')}_timestamps`)).getRange();
    var timestampsLocCol = timestamps.getA1Notation().substr(0, 1);
    var timestampsLocRow = e.range.getA1Notation().substr(1);

    if (e.range.isChecked()) {
      //add a timestamp and set a note of the last timestamp added, in case the box was unchecked on accident
      e.range.getSheet().getRange(`${timestampsLocCol}${timestampsLocRow}`).setValue(now).setNote(`Last edit: ${now}`);
    //if the checkbox was unchecked...
    } else {
      //remove the timestamp, but keep the note in case the box was unchecked on accident
      e.range.getSheet().getRange(`${timestampsLocCol}${timestampsLocRow}`).setValue('');
    }
  }
}

//some code that Ms. Jayaprakash made
/*function onEdit() {
  var ss = SpreadsheetApp.getActiveSheet();

  if(ss.getName() == "Default Sheet" ) { //checks that we're on the correct sheet
    var tickboxCell = s.getActiveCell();
    if(tickboxCell.getColumn() == 9 && tickboxCell.getValue() === 'TRUE' ) { //checks the status of the tickbox
      var dateCell = tickboxCell.offset(0, 1);
      dateCell.setValue(new Date());
    }
  }
}*/