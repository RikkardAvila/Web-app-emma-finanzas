// Manejo de navegación activa y búsqueda de página actual
window.addEventListener('DOMContentLoaded', () => {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-item').forEach((item) => {
    const href = item.getAttribute('href');
    if (href && href === current) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Mapear enlaces de nav dentro de negocios
  const navMap = {
    'inventario': 'inventario.html',
    'ventas': 'ventas.html'
  };
  document.querySelectorAll('[data-nav]').forEach((button) => {
    const target = button.dataset.nav;
    if (navMap[target]) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = navMap[target];
      });
    }
  });

  // Botón Nuevo lleva a transacciones
  const newButton = document.querySelector('.btn.ghost');
  if (newButton) {
    newButton.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = 'transacciones.html';
    });
  }

  // Inicializar transacciones si estamos en la página de transacciones
  const txDateInput = document.getElementById('tx-date');
  const txForm = document.getElementById('transaction-form');
  const txTableBody = document.querySelector('#tx-table tbody');

  let formattedDate = null;
  if (txDateInput) {
    const today = new Date();
    formattedDate = today.toISOString().split('T')[0];
    txDateInput.value = formattedDate;
    txDateInput.max = '9999-12-31';
    txDateInput.min = '1900-01-01';
  }

  if (txForm && txTableBody) {
    txForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const txType = document.getElementById('tx-type').value;
      const amountValue = document.getElementById('tx-amount').value;
      const amount = parseFloat(amountValue).toFixed(2);
      const category = document.getElementById('tx-category').value.trim();
      const desc = document.getElementById('tx-desc').value.trim();
      const date = document.getElementById('tx-date').value;

      if (!amountValue || isNaN(amount) || !category || !desc || !date) return;

      const row = document.createElement('tr');
      const sign = txType === 'gasto' ? '-' : '';
      row.innerHTML = `<td>${txType}</td><td>${sign}$${amount}</td><td>${category}</td><td>${desc}</td><td>${date}</td>`;
      txTableBody.prepend(row);

      txForm.reset();
      if (txDateInput && formattedDate) {
        txDateInput.value = formattedDate;
      }
    });
  }

  // Inventario: edición/creación/eliminación
  const invForm = document.getElementById('inventory-form');
  const invTableBody = document.querySelector('#inv-table tbody');

  function updateRowValues(row, item, category, stock, price) {
    const value = (stock * price).toFixed(2);
    row.children[0].textContent = item;
    row.children[1].textContent = category;
    row.children[2].textContent = stock;
    row.children[3].textContent = `$${Number(price).toFixed(2)}`;
    row.children[4].textContent = `$${value}`;
  }

  function createActionCell() {
    const cell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'btn ghost edit-item';
    editButton.textContent = 'Editar';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn ghost delete-item';
    deleteButton.textContent = 'Eliminar';

    cell.append(editButton, document.createTextNode(' '), deleteButton);
    return cell;
  }

  function attachInventoryEvents(row) {
    const editButton = row.querySelector('.edit-item');
    const deleteButton = row.querySelector('.delete-item');

    if (!editButton || !deleteButton) return;

    editButton.addEventListener('click', () => {
      const invItem = document.getElementById('inv-item');
      const invCategory = document.getElementById('inv-category');
      const invStock = document.getElementById('inv-stock');
      const invPrice = document.getElementById('inv-price');
      const invEditIndex = document.getElementById('inv-edit-index');

      invItem.value = row.children[0].textContent;
      invCategory.value = row.children[1].textContent;
      invStock.value = row.children[2].textContent;
      invPrice.value = parseFloat(row.children[3].textContent.replace('$', ''));
      invEditIndex.value = Array.from(invTableBody.rows).indexOf(row);
      document.getElementById('inv-add-btn').textContent = 'Actualizar';
    });

    deleteButton.addEventListener('click', () => {
      row.remove();
      const invEditIndex = document.getElementById('inv-edit-index');
      if (invEditIndex.value && parseInt(invEditIndex.value, 10) === Array.from(invTableBody.rows).indexOf(row)) {
        invForm.reset();
        invEditIndex.value = '';
        document.getElementById('inv-add-btn').textContent = 'Agregar';
      }
    });
  }

  if (invForm && invTableBody) {
    Array.from(invTableBody.rows).forEach((row) => attachInventoryEvents(row));

    invForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const invItem = document.getElementById('inv-item').value.trim();
      const invCategory = document.getElementById('inv-category').value.trim();
      const invStock = Number(document.getElementById('inv-stock').value);
      const invPrice = Number(document.getElementById('inv-price').value);
      const invEditIndex = document.getElementById('inv-edit-index').value;

      if (!invItem || !invCategory || isNaN(invStock) || isNaN(invPrice)) return;

      if (invEditIndex !== '') {
        const row = invTableBody.rows[invEditIndex];
        if (row) {
          updateRowValues(row, invItem, invCategory, invStock, invPrice);
        }
        document.getElementById('inv-edit-index').value = '';
        document.getElementById('inv-add-btn').textContent = 'Agregar';
      } else {
        const newRow = document.createElement('tr');
        const value = (invStock * invPrice).toFixed(2);
        newRow.innerHTML = `<td>${invItem}</td><td>${invCategory}</td><td>${invStock}</td><td>$${invPrice.toFixed(2)}</td><td>$${value}</td>`;
        newRow.appendChild(createActionCell());
        invTableBody.prepend(newRow);
        attachInventoryEvents(newRow);
      }

      invForm.reset();
    });
  }

  // Ventas: edición/creación/eliminación
  const salesForm = document.getElementById('sales-form');
  const salesTableBody = document.querySelector('#sales-table tbody');

  function attachSalesEvents(row) {
    const editBtn = row.querySelector('.sales-edit');
    const deleteBtn = row.querySelector('.sales-delete');
    if (!editBtn || !deleteBtn) return;

    editBtn.addEventListener('click', () => {
      document.getElementById('sales-date').value = row.children[0].textContent;
      document.getElementById('sales-product').value = row.children[1].textContent;
      document.getElementById('sales-qty').value = row.children[2].textContent;
      document.getElementById('sales-total').value = row.children[3].textContent.replace('$', '').replace(',', '');
      document.getElementById('sales-client').value = row.children[4].textContent;
      document.getElementById('sales-edit-index').value = Array.from(salesTableBody.rows).indexOf(row);
      document.getElementById('sales-add-btn').textContent = 'Actualizar';
    });

    deleteBtn.addEventListener('click', () => {
      const editIndex = Number(document.getElementById('sales-edit-index').value);
      row.remove();
      if (!isNaN(editIndex) && editIndex === Array.from(salesTableBody.rows).indexOf(row)) {
        salesForm.reset();
        document.getElementById('sales-edit-index').value = '';
        document.getElementById('sales-add-btn').textContent = 'Agregar';
      }
    });
  }

  if (salesForm && salesTableBody) {
    Array.from(salesTableBody.rows).forEach((row) => attachSalesEvents(row));

    salesForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const date = document.getElementById('sales-date').value;
      const product = document.getElementById('sales-product').value.trim();
      const qty = Number(document.getElementById('sales-qty').value);
      const total = Number(document.getElementById('sales-total').value);
      const client = document.getElementById('sales-client').value.trim();
      const editIndex = document.getElementById('sales-edit-index').value;

      if (!date || !product || isNaN(qty) || qty <= 0 || isNaN(total) || total < 0 || !client) return;

      if (editIndex !== '') {
        const row = salesTableBody.rows[editIndex];
        if (row) {
          row.children[0].textContent = date;
          row.children[1].textContent = product;
          row.children[2].textContent = qty;
          row.children[3].textContent = `$${total.toFixed(2)}`;
          row.children[4].textContent = client;
        }
        document.getElementById('sales-edit-index').value = '';
        document.getElementById('sales-add-btn').textContent = 'Agregar';
      } else {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `<td>${date}</td><td>${product}</td><td>${qty}</td><td>$${total.toFixed(2)}</td><td>${client}</td><td><button class="btn ghost sales-edit" type="button">Editar</button> <button class="btn ghost sales-delete" type="button">Eliminar</button></td>`;
        salesTableBody.prepend(newRow);
        attachSalesEvents(newRow);
      }

      salesForm.reset();
      document.getElementById('sales-add-btn').textContent = 'Agregar';
    });
  }
});
