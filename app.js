// Manejo de navegación activa y búsqueda de página actual
window.addEventListener('DOMContentLoaded', async () => {
  // Verificar sesión actual para asociar datos al usuario
  const { data: { session } } = await supabaseApp.auth.getSession();
  const currentUser = session ? session.user : null;

  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-item').forEach((item) => {
    const href = item.getAttribute('href');
    if (href && href === current) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Mobile nav logic
  document.querySelectorAll('.mobile-nav-item').forEach((item) => {
    const href = item.getAttribute('data-nav-mobile');
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

  // --- TRANSACCIONES ---
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

  async function loadTransactions() {
    if (!txTableBody || !currentUser) return;
    const { data: txs, error } = await supabaseApp
      .from('transacciones')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error al cargar transacciones:', error);
      return;
    }
    
    txTableBody.innerHTML = '';
    txs.forEach(tx => {
      const row = document.createElement('tr');
      const sign = tx.type === 'gasto' ? '-' : '';
      row.innerHTML = `<td>${tx.type}</td><td>${sign}$${tx.amount}</td><td>${tx.category}</td><td>${tx.description}</td><td>${tx.date}</td>`;
      txTableBody.appendChild(row);
    });
  }

  if (txTableBody) loadTransactions();

  if (txForm && txTableBody && currentUser) {
    txForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const txType = document.getElementById('tx-type').value;
      const amountValue = document.getElementById('tx-amount').value;
      const amount = parseFloat(amountValue).toFixed(2);
      const category = document.getElementById('tx-category').value.trim();
      const desc = document.getElementById('tx-desc').value.trim();
      const date = document.getElementById('tx-date').value;

      if (!amountValue || isNaN(amount) || !category || !desc || !date) return;

      const { error } = await supabaseApp.from('transacciones').insert([{
        user_id: currentUser.id,
        type: txType,
        amount: amount,
        category: category,
        description: desc,
        date: date
      }]);

      if (error) {
        console.error('Error al guardar transacción:', error);
        alert('Hubo un error al guardar la transacción');
        return;
      }

      await loadTransactions();
      txForm.reset();
      if (txDateInput && formattedDate) {
        txDateInput.value = formattedDate;
      }
    });
  }

  // --- INVENTARIO ---
  const invForm = document.getElementById('inventory-form');
  const invTableBody = document.querySelector('#inv-table tbody');

  async function loadInventory() {
    if (!invTableBody || !currentUser) return;
    const { data: items, error } = await supabaseApp
      .from('inventario')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('item', { ascending: true });
      
    if (error) {
      console.error('Error al cargar inventario:', error);
      return;
    }
    
    invTableBody.innerHTML = '';
    items.forEach(item => {
      renderInventoryRow(item);
    });
  }

  function renderInventoryRow(invObj) {
    const row = document.createElement('tr');
    row.dataset.id = invObj.id; // Store ID to update/delete
    const value = (invObj.stock * invObj.price).toFixed(2);
    row.innerHTML = `<td>${invObj.item}</td><td>${invObj.category}</td><td>${invObj.stock}</td><td>$${Number(invObj.price).toFixed(2)}</td><td>$${value}</td>`;
    row.appendChild(createActionCell());
    invTableBody.appendChild(row);
    attachInventoryEvents(row);
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
      invEditIndex.value = row.dataset.id; // Store DB id
      
      document.getElementById('inv-add-btn').textContent = 'Actualizar';
    });

    deleteButton.addEventListener('click', async () => {
      const dbId = row.dataset.id;
      if (confirm('¿Seguro de eliminar este producto?')) {
        const { error } = await supabaseApp.from('inventario').delete().eq('id', dbId);
        if (error) {
          console.error(error);
          alert('Error al eliminar');
          return;
        }
        row.remove();
        const invEditIndex = document.getElementById('inv-edit-index');
        if (invEditIndex.value === dbId) {
          invForm.reset();
          invEditIndex.value = '';
          document.getElementById('inv-add-btn').textContent = 'Agregar';
        }
      }
    });
  }

  if (invTableBody) loadInventory();

  if (invForm && invTableBody && currentUser) {
    invForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const invItemVal = document.getElementById('inv-item').value.trim();
      const invCategoryVal = document.getElementById('inv-category').value.trim();
      const invStockVal = Number(document.getElementById('inv-stock').value);
      const invPriceVal = Number(document.getElementById('inv-price').value);
      const editId = document.getElementById('inv-edit-index').value;

      if (!invItemVal || !invCategoryVal || isNaN(invStockVal) || isNaN(invPriceVal)) return;

      if (editId !== '') {
        const { error } = await supabaseApp.from('inventario').update({
          item: invItemVal,
          category: invCategoryVal,
          stock: invStockVal,
          price: invPriceVal
        }).eq('id', editId);
        
        if (error) {
          console.error(error);
          alert('Error al actualizar');
          return;
        }
        
        document.getElementById('inv-edit-index').value = '';
        document.getElementById('inv-add-btn').textContent = 'Agregar';
        await loadInventory();
      } else {
        const { error } = await supabaseApp.from('inventario').insert([{
          user_id: currentUser.id,
          item: invItemVal,
          category: invCategoryVal,
          stock: invStockVal,
          price: invPriceVal
        }]);
        
        if (error) {
          console.error('Error al insertar:', error);
          alert('Error al agregar');
          return;
        }
        await loadInventory();
      }

      invForm.reset();
    });
  }

  // --- VENTAS ---
  const salesForm = document.getElementById('sales-form');
  const salesTableBody = document.querySelector('#sales-table tbody');

  async function loadSales() {
    if (!salesTableBody || !currentUser) return;
    const { data: sales, error } = await supabaseApp
      .from('ventas')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error al cargar ventas:', error);
      return;
    }
    
    salesTableBody.innerHTML = '';
    sales.forEach(sale => {
      renderSalesRow(sale);
    });
  }

  function renderSalesRow(saleObj) {
    const row = document.createElement('tr');
    row.dataset.id = saleObj.id;
    row.innerHTML = `<td>${saleObj.date}</td><td>${saleObj.product}</td><td>${saleObj.qty}</td><td>$${Number(saleObj.total).toFixed(2)}</td><td>${saleObj.client}</td><td><button class="btn ghost sales-edit" type="button">Editar</button> <button class="btn ghost sales-delete" type="button">Eliminar</button></td>`;
    salesTableBody.appendChild(row);
    attachSalesEvents(row);
  }

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
      document.getElementById('sales-edit-index').value = row.dataset.id;
      document.getElementById('sales-add-btn').textContent = 'Actualizar';
    });

    deleteBtn.addEventListener('click', async () => {
      const dbId = row.dataset.id;
      if (confirm('¿Seguro de eliminar esta venta?')) {
        const { error } = await supabaseApp.from('ventas').delete().eq('id', dbId);
        if (error) {
          console.error(error);
          alert('Error al eliminar');
          return;
        }
        
        row.remove();
        const editId = document.getElementById('sales-edit-index').value;
        if (editId === dbId) {
          salesForm.reset();
          document.getElementById('sales-edit-index').value = '';
          document.getElementById('sales-add-btn').textContent = 'Agregar';
        }
      }
    });
  }

  if (salesTableBody) loadSales();

  if (salesForm && salesTableBody && currentUser) {
    salesForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const dateVal = document.getElementById('sales-date').value;
      const productVal = document.getElementById('sales-product').value.trim();
      const qtyVal = Number(document.getElementById('sales-qty').value);
      const totalVal = Number(document.getElementById('sales-total').value);
      const clientVal = document.getElementById('sales-client').value.trim();
      const editId = document.getElementById('sales-edit-index').value;

      if (!dateVal || !productVal || isNaN(qtyVal) || qtyVal <= 0 || isNaN(totalVal) || totalVal < 0 || !clientVal) return;

      if (editId !== '') {
        const { error } = await supabaseApp.from('ventas').update({
          date: dateVal,
          product: productVal,
          qty: qtyVal,
          total: totalVal,
          client: clientVal
        }).eq('id', editId);
        
        if (error) {
          console.error(error);
          alert('Error al actualizar');
          return;
        }
        document.getElementById('sales-edit-index').value = '';
        document.getElementById('sales-add-btn').textContent = 'Agregar';
        await loadSales();
      } else {
        const { error } = await supabaseApp.from('ventas').insert([{
          user_id: currentUser.id,
          date: dateVal,
          product: productVal,
          qty: qtyVal,
          total: totalVal,
          client: clientVal
        }]);
        
        if (error) {
          console.error(error);
          alert('Error al guardar');
          return;
        }
        await loadSales();
      }

      salesForm.reset();
      document.getElementById('sales-add-btn').textContent = 'Agregar';
    });
  }
});
