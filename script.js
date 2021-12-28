let allShops = [];
let valueShop = '';
let valuePrice = '';
const link = 'http://localhost:8000';
let inputShop = null;
let inputPrice = null;
let dateNow = new Date().toLocaleDateString();
let currentDate = dateNow.split('/').join('.')

const getAllShops = async () => {
    const resp = await fetch(`${link}/allShops`, {
        method: 'GET'
    });
    const result = await resp.json();
    allShops = result.data;
    render();
}

let spending = 0;

const total = () => {
    let sumCost = allShops.reduce(function (sum, currentSum) {
        return sum + currentSum.cost;
    }, spending);
    return sumCost
}

window.onload = async function init() {
    inputShop = document.getElementById('add-shop');
    inputShop.addEventListener('change', updateText);
    inputPrice = document.getElementById('add-costs');
    inputPrice.addEventListener('change', updateCost);
    getAllShops();
}

onClickAddBtn = async () => {
    if (valueShop && valuePrice) {
        const resp = await fetch(`${link}/createShop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                text: valueShop,
                data: currentDate,
                cost: valuePrice
            })
        });

        const result = await resp.json()
            .then((resp) => {
                allShops.push(resp)
                inputShop.value = '';
                inputPrice.value = '';
                valueShop = '';
                valuePrice = ''
                render()
            })
    } else {
        alert('Введите хоть какое-то значение');
    }
}

const render = () => {
    
    const content = document.getElementById("shop-list");
    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }

    allShops.map((item, index) => {
        const container = document.createElement('div');
        container.id = `cost${index}`;
        container.className = 'cost-container';
        const list = document.createElement('div');
        list.className = 'list';
        const listItem = document.createElement('p');
        listItem.innerText = index + 1 + ") " + "Магазин " + "\"" + item.text + '\"';
        const dataCostImgContainer = document.createElement('div')
        dataCostImgContainer.className = "data-cost-image";
        const dataCostContainer = document.createElement('div');
        const updateData = document.createElement('span');
        updateData.innerHTML = currentDate;
        dataCostContainer.append(updateData);
        const price = document.createElement('p');
        price.innerText = `${item.cost} p. `;
        dataCostContainer.append(price);
        dataCostContainer.className = ('data-cost');
        const imgContainer = document.createElement('div');
        imgContainer.className = ('img-container');
        const imageEdit = document.createElement('img');
        imageEdit.src = 'images/edit.png';
        imageEdit.onclick = () => {
            list.remove();
            dataCostImgContainer.remove();
            editShop(item, item._id, container)
        }

        const imageDelete = document.createElement('img');
        imageDelete.src = 'images/delete.png';
        imageDelete.onclick = () => deleteShop(item._id);

        list.append(listItem);
        imgContainer.append(imageEdit);
        imgContainer.append(imageDelete);
        dataCostImgContainer.append(dataCostContainer);
        dataCostImgContainer.append(imgContainer);
        container.append(list);
        container.append(dataCostImgContainer);
        content.append(container);
    });
    document.getElementById('final-cost').innerText = `Итого:${total(allShops)} р.`;
}

const deleteShop = async (itemId) => {
    if (allShops.length === 1) {
        sumCost = null;
        document.getElementById('final-cost').innerHTML = sumCost;
    }

    const resp = await fetch(`${link}/deleteShop?id=${itemId}`, {
        method: 'DELETE'
    });

    if (resp.status === 200) {
        allShops.forEach((item, index) => {
          if (item._id === itemId) {
            allShops.splice(index, 1)
          }
          return allShops;
        })
        render()
      } else {
        alert('Всё очень плохо :(' + resp.status)
      }
}

const updateText = (event) => {
    valueShop = event.target.value;
}

const updateCost = (event) => {
    valuePrice = event.target.value;
}

const editShop = async (item, id, container) => {
    const editInputShop = document.createElement('input');
    const editInputPrice = document.createElement('input');
    const editInputBtn = document.createElement('button');
    const editDiv = document.createElement('div');
    editInputShop.type = 'text';
    editInputPrice.type = 'number';
    editInputShop.value = item.text;
    editInputPrice.value = item.cost;
    editInputBtn.innerText = 'Edit';
    editDiv.className = 'edit-inputs'
    container.append(editDiv);
    editDiv.append(editInputShop);
    editDiv.append(editInputPrice);
    editDiv.append(editInputBtn);

    editInputShop.addEventListener('change', (e) => editInputShop.value = e.target.value);
    editInputPrice.addEventListener('change', (e) => editInputPrice.value = e.target.value);
    editInputBtn.addEventListener('click', () => {
        updateShopInfo(id, editInputShop.value, editInputPrice.value);
    });
}

const updateShopInfo = async (id, valueShop, valueCost) => {
    if (valueShop && valueCost) {
        const resp = await fetch(`${link}/updateShop`, {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                _id: id,
                text: valueShop,
                cost: valueCost
            })
        })
        if (resp.status === 200) {

            allShops = allShops.map((item) => {
              const newShop = {...item};
              if (item._id === id) {
                newShop.text = valueShop;
                newShop.cost = valueCost;
              }
              return newShop;
            })
            getAllShops()
          } else {
            alert('Всё очень плохо :(' + resp.status)
          }
    } else {
        alert("Введите корректное значение!")
    }
}