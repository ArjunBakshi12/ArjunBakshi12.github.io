"use strict";
window.onload = function() {
    var studyListData = Study_Array_Data;
    var el = document.querySelector("body");
    if (el.dataset.title === "main-view") {
        viewer.buildTable(studyListData);
    } else if (el.dataset.title === "header-view") {
        viewer.getViewer();
        viewer.createHeader(studyListData);
    } 
}

// Use module.exports only in Node
var root = this.window;
if (root === this || typeof module == 'undefined') { //Browser
    var viewer = {};
} else {
    var viewer = module.exports = {}; //Node
}


/**
 * Method that creates patient objects from
 * the study list.
 * @param: data: The study_list array data.
 * @returns: An array of patient objects.
 */
viewer.createPatient = function (data) {
    if(data.length === 0 || data instanceof Array === false) {
        return null;
    }
    var patients = [];
     
    data.forEach(function(study) {
        var patient = new Object();
        var firstName = study.Patient_Name_First;
        var lastName = study.Patient_Name_Last;
        var name = lastName + ', ' + firstName;
        var height = viewer.roundTenth(study.Patient_Height);
        var weight = viewer.roundTenth(study.Patient_Weight);
        var dob = study.Patient_DOB.replace(/-/g, "/");
        var date = study.Exam_Date.replace(/-/g, "/");

        if(height === null) {
            height = "\u2014";
        }

        if(weight === null) {
            weight = "\u2014";
        }

        if (dob === "unknown") {
            dob = "\u2014";
        }

        if (date === "unknown") {
            date = "\u2014";
        }

        if (!firstName && !lastName) {
            name = study.Patient_Name_Full;
        } else if (!firstName) {
            name = lastName + ", \u2014"; 
        } else if (!lastName) {
            name = "\u2014, " + firstName;
        }

        patient.uuid = study.Study_UUID;
        patient.id = study.Study_ID;
        patient.mrn = study.MRN;
        patient.patientName = name;
        patient.linkName = study.Patient_Name_Full;
        patient.dob = dob;
        patient.studyDate = date;
        patient.linkDate = study.Exam_Date;
        patient.height = height + ' ' + study.Patient_Height_unit;
        patient.weight = weight + ' ' + study.Patient_Weight_unit;
        patient.sex = study.Patient_SEX;     
        patient.type = study.Exam_Type;
        patients.push(patient);
    });
    return patients;
};

/**
 * Method that gets the value of a parameter from the url.
 * @param name: a string representing the parameter.
 * @returns string value of parameter.
 */
viewer.getParameterByName = function (name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
    if (!results) {
        return undefined;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

/**
 * Method that builds the exam list table.
 * @param data: The study list data used to create the patient.
 */
viewer.buildTable = function (data) {
    var tbody = document.getElementById('studies');
    var patients = viewer.createPatient(data);
    if(patients === null) {
        viewer.noData();
    } else {
        patients.forEach(function(patient) {
        var tableVals = []; 
        tableVals.push(patient.patientName, patient.mrn, patient.studyDate, patient.type);
        var row = document.createElement('tr');
        tableVals.forEach(function(val){
            var text = document.createTextNode(val);
            var tdVal = document.createElement('td');
            var link = document.createElement('a');
            link.href = "System_Files/header.html?study=" + patient.uuid 
                + "&name=" + patient.linkName
                + "&date=" + patient.linkDate
                + "&id=" + patient.id; 
            
            link.appendChild(text);
            tdVal.appendChild(link);
            row.appendChild(tdVal); 
        });
        tbody.appendChild(row);
        });
    }
};   

/**
 * Method that dynamically creates the <embed>
 * which contains the viewer and appends it to the
 * window.
 */
viewer.getViewer = function () {
    var name = viewer.getParameterByName("name");
    var date = viewer.getParameterByName("date");
    var id = viewer.getParameterByName("id");
    var studyDir = name + '_' + date + '_' + id;
    var embedDiv = document.getElementById("viewerEmbed");
    var embed = document.createElement("embed");
    embed.height = "80%";
    embed.width = "100%";
    embed.src = "../Exam_VendorNeutral/" + studyDir + "/Exam_Data/Viewer/index.html";
    embedDiv.appendChild(embed);
};  

/**
 * Method that creates the header <ul>.
 * @param data: The study list data used to create the patient.
 */
viewer.createHeader = function (data) {
    var patients = viewer.createPatient(data);
    var thisStudy = viewer.getParameterByName("study");
    var patient;
    var ul = document.getElementById('info-ul');
    var li = document.createElement('li');

    patients.forEach(function(patientObj){
        if(patientObj.uuid === thisStudy) {
            patient = patientObj;
        }
        return patient;
    })
    delete patient.uuid;
    delete patient.linkName;
    delete patient.linkDate;
    delete patient.id;

    for (var key in patient) {
        var val = patient[key];
        //if no value add -
        if (!val) {
            val = "\u2014";
        }
        if (key === "type") {
            key = "exam type";
        }
        //Create UL
        var keyEle = document.createTextNode(key + ": ");
        var value = document.createTextNode(val);
        var labelSpan = document.createElement('span');
        labelSpan.classList.add('label');
        var dataSpan = document.createElement('span');
        dataSpan.classList.add('data');

        for(var i = 0; i < 8; i++) {
            var li = document.createElement('li');
            labelSpan.appendChild(keyEle);
            dataSpan.appendChild(value); 
            li.appendChild(labelSpan);
            li.appendChild(dataSpan);
            
        }
        ul.appendChild(li);
    }
    viewer.setName(patient);
};


/**
 * Method that dynamically creates the patient 
 * name header for the page.
 * @param patientObj: The patient object containing the name.
 */
viewer.setName = function (patientObj) {
    var nameDiv = document.getElementById('name');
    var h1 = document.createElement('h1');
    var nameH1 = document.createTextNode(patientObj.patientName);
    h1.id = "patient-name";
    h1.appendChild(nameH1);
    nameDiv.appendChild(h1);
};

/**
 * Method that creates a creates a tr if there
 * is no data to display. 
 */
viewer.noData = function() {
    var tbody = document.getElementById('studies');
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var message = document.createTextNode("No Data Available");
    td.appendChild(message);
    tbody.appendChild(tr);
    tr.appendChild(td);
    td.id = "no-data";
    td.colSpan = "4";
};

/**
 * Method that rounds a number to the nearest tenth
 * of a decimal.
 * @param number: The number to be rounded.
 */
viewer.roundTenth = function(number) {
    var newNumber = parseFloat(number, 10);

    if(typeof newNumber !== 'number' || isNaN(newNumber)) {
        return null;
    }
    return Math.round(newNumber * 10) / 10;    
};
