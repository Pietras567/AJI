
"use strict"
let todoList = []; //declares a new array for Your todo list

let dateFilterEnabled = false;

let initList = function () {
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

let updateJSONbin = function () {
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

let deleteTodo = function (index) {
    todoList.splice(index, 1);
    updateJSONbin();
}


let dateFilter = function () {
    let startDate = document.getElementById("inputStartDate").value ? new Date(document.getElementById("inputStartDate").value) : null;
    let endDate = document.getElementById("inputEndDate").value ? new Date(document.getElementById("inputEndDate").value) : null;

    return todoList.filter(todo => {

        let dueDate = new Date(todo.dueDate); // Konwertowanie daty zadania na format Date

        return (!startDate || dueDate >= startDate) &&
            (!endDate || dueDate <= endDate);

    })

}


let updateTodoList = function () {
    let todoListDiv = document.getElementById("todoListView");

    while (todoListDiv.firstChild) {
        todoListDiv.removeChild(todoListDiv.firstChild);
    }
    renderTable(todoListDiv);
}

let enableDateFilter = function () {
    dateFilterEnabled = !dateFilterEnabled;

}

let renderTable = function (todoListDiv) {

    let visibleList;

    let filterInput = document.getElementById("inputSearch");

    let table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-bordered");

    let headerRow = document.createElement("tr");
    headerRow.classList.add("table-header");
    ["Title", "Description", "Place", "Category", "Due Date", "Delete"].forEach(headerText => {
        let headerCell = document.createElement("th");
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);


    if (dateFilterEnabled) {
        visibleList = dateFilter();
    } else {
        visibleList = todoList
    }


    visibleList.forEach((todo, index) => {

            let textFilter = ((filterInput.value === "") ||
                (todo.title.includes(filterInput.value)) ||
                (todo.description.includes(filterInput.value)) ||
                (todo.place.includes(filterInput.value)) ||
                (todo.category.includes(filterInput.value)))
            if (
                textFilter
            ) {

                let row = document.createElement("tr");

                let titleCell = document.createElement("td");
                titleCell.textContent = todo.title;
                row.appendChild(titleCell);

                let descriptionCell = document.createElement("td");
                descriptionCell.textContent = todo.description;
                row.appendChild(descriptionCell);

                let placeCell = document.createElement("td");
                placeCell.textContent = todo.place;
                row.appendChild(placeCell);

                let categoryCell = document.createElement("td");
                categoryCell.textContent = todo.category;
                row.appendChild(categoryCell);


                let dateCell = document.createElement("td");
                dateCell.textContent = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : "";
                row.appendChild(dateCell);

                let deleteCell = document.createElement("td");
                let deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.value = "x";
                deleteButton.classList.add("btn", "btn-dark", "btn-sm");
                deleteButton.addEventListener("click", function () {
                    deleteTodo(index);
                });
                deleteCell.appendChild(deleteButton);
                row.appendChild(deleteCell);

                table.appendChild(row);
            }
        }
    );

    todoListDiv.appendChild(table);

};



async function groqChatCompletion(textDescription) {
    const apiKey = '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';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const requestBody = {
        model: 'llama3-8b-8192',
        messages: [
            {
                role: 'system',
                content: 'Categorize the following text description into one of the categories: \'praca\', \'życie prywatne\', \'studia\'. Respond using ONLY one of these categories, no more words'
            },
            {
                role: 'user',
                content: textDescription
            }
        ]
    };

    console.log(JSON.stringify(prompt));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        const result = await response.json();

        console.log(result);
        return result.choices[0].message.content.trim();

    } catch (error) {
        console.error(error);
    }

}

let addTodo = async function () {
    //get the elements in the form
    let inputTitle = document.getElementById("inputTitle");
    let inputDescription = document.getElementById("inputDescription");
    let inputPlace = document.getElementById("inputPlace");
    let inputDueDate = document.getElementById("inputDueDate");
    //get the values from the form

    let textDescription = `${inputTitle.value} : ${inputDescription.value}`;

    let category = '';
    try {
        category = await groqChatCompletion(textDescription);
    } catch (error) {
        console.error("Error categorizing task:", error);
        category = "Uncategorized";
    }


    let newTitle = inputTitle.value;
    let newDescription = inputDescription.value;
    let newPlace = inputPlace.value;
    let newDate = new Date(inputDueDate.value);


    //create new item
    let newTodo = {
        title: newTitle,
        description: newDescription,
        place: newPlace,
        category: category,
        dueDate: newDate
    };
    //add item to the list
    todoList.push(newTodo);

    //window.localStorage.setItem("todos", JSON.stringify(todoList));

    updateJSONbin();
}

initList();

setInterval(updateTodoList, 1000);



