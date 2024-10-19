"use strict"
let todoList = []; //declares a new array for Your todo list

let initList = function() {
    /*
    let savedList = window.localStorage.getItem("todos");
    if (savedList != null)
        todoList = JSON.parse(savedList);
    else
        todoList.push(
        {
            title: "Learn JS",
            description: "Create a demo application for my TODO's",
            place: "445",
            category: '',
            dueDate: new Date(2024,10,16)
        },
        {
            title: "Lecture test",
            description: "Quick test from the first three lectures",
            place: "F6",
            category: '',
            dueDate: new Date(2024,10,17)
        }
            // of course the lecture test mentioned above will not take place
        );
    */
    
    //let savedList = window.localStorage.getItem("todos");
    //if (savedList != null)
    //    todoList = JSON.parse(savedList);

    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            if (req.responseText != null) {
                console.log(req.responseText);
                let jsonResponse = JSON.parse(req.responseText);
                console.log(jsonResponse);
        
                // Sprawdzanie struktury odpowiedzi
                if (jsonResponse.record) {
                    console.log("jsonResponse.record:", jsonResponse.record);
                    if (Array.isArray(jsonResponse.record)) {
                        jsonResponse.record.forEach(item => todoList.push(item)); // Dodawanie sparsowanych elementów do todoList, jeśli są tablicą
                    } else {
                        todoList.push(jsonResponse.record); // Jeśli nie jest tablicą, dodaj odpowiedź jako pojedynczy element
                    }
                } else {
                    console.error("Unexpected response structure:", jsonResponse);
                }
        
                console.log(todoList);
            }
        }
    };
        
    req.open("GET", "https://api.jsonbin.io/v3/b/67142f0eacd3cb34a899d44e/latest", true);
    req.setRequestHeader("X-Master-Key", "$2a$10$AJpz2YeRbubCbtKW94i7lOvFvui8/y3lNRQbqMNnZaW6/fOlUA7FS");
    req.send();
}

let updateJSONbin = function() {
    // UWAGA: ta funkcja zastepuje całą zawartość bina
    let req = new XMLHttpRequest();
    req.open("PUT", "https://api.jsonbin.io/v3/b/67142f0eacd3cb34a899d44e", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("X-Master-Key", "$2a$10$AJpz2YeRbubCbtKW94i7lOvFvui8/y3lNRQbqMNnZaW6/fOlUA7FS");

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            if (req.status == 200) {
                console.log("Bin successfully updated.");
            } else {
                console.error("Failed to update bin:", req.statusText);
            }
        }
    };

    req.send(JSON.stringify(todoList));
}

let deleteTodo = function(index) {
    todoList.splice(index,1);
    updateJSONbin();
}

let updateTodoList = function() {
    let todoListDiv =
    document.getElementById("todoListView");

    //remove all elements
    while (todoListDiv.firstChild) {
        todoListDiv.removeChild(todoListDiv.firstChild);
    }

    //add all elements
    let filterInput = document.getElementById("inputSearch");   

    //add all elements
    for (let todo in todoList) {
        if (
            (filterInput.value == "") ||
            (todoList[todo].title.includes(filterInput.value)) ||
            (todoList[todo].description.includes(filterInput.value))
        ) {
            let newElement = document.createElement("p");
            let newContent = document.createTextNode(todoList[todo].title + " " +
                                                     todoList[todo].description);
            newElement.appendChild(newContent);
            todoListDiv.appendChild(newElement);

            let newDeleteButton = document.createElement("input");
            newDeleteButton.type = "button";
            newDeleteButton.value = "x";
            newDeleteButton.addEventListener("click",
                function() {
                    deleteTodo(todo);
                });

            newElement.appendChild(newDeleteButton);
        }
    }
}

let addTodo = function() {
    //get the elements in the form
    let inputTitle = document.getElementById("inputTitle");
    let inputDescription = document.getElementById("inputDescription");
    let inputPlace = document.getElementById("inputPlace");
    let inputDate = document.getElementById("inputDate");
    //get the values from the form
    let newTitle = inputTitle.value;
    let newDescription = inputDescription.value;
    let newPlace = inputPlace.value;
    let newDate = new Date(inputDate.value);
    //create new item
    let newTodo = {
        title: newTitle,
        description: newDescription,
        place: newPlace,
        category: '',
        dueDate: newDate
    };
    //add item to the list
    todoList.push(newTodo);

    //window.localStorage.setItem("todos", JSON.stringify(todoList));

    updateJSONbin();
  }


initList();

setInterval(updateTodoList, 1000);



