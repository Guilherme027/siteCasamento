import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAlQY1K2Rz2_va1Wns6YxpjMFKwmDUIRKg",
    authDomain: "sitecasamento-fc6be.firebaseapp.com",
    databaseURL: "https://sitecasamento-fc6be-default-rtdb.firebaseio.com",
    projectId: "sitecasamento-fc6be",
    storageBucket: "sitecasamento-fc6be.appspot.com",
    messagingSenderId: "894669874009",
    appId: "1:894669874009:web:e99eda528e82686ce46248",
    measurementId: "G-HWXLCL07Q4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Credenciais de admin
const ADMIN_EMAIL = "noivos@hotmail.com";

// Referências aos elementos
const loginForm = document.getElementById('loginForm');
const adminContainer = document.getElementById('adminContainer');
const loginContainer = document.getElementById('loginContainer');
const guestListContainer = document.getElementById('guestListContainer');
const addGuestBtn = document.getElementById('addGuestBtn');
const addGuestForm = document.getElementById('addGuestForm');
const saveGuestBtn = document.getElementById('saveGuestBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const exportBtn = document.getElementById('exportBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Login do admin
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
    }
});

// Função de logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        alert('Erro ao fazer logout: ' + error.message);
    }
});

// Carregar lista de convidados
function loadGuests() {
    const q = query(collection(db, 'guests'), orderBy('name'));

    onSnapshot(q, (snapshot) => {
        guestListContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const guest = doc.data();
            const guestItem = document.createElement('div');
            guestItem.className = 'guest-item';
            guestItem.dataset.id = doc.id;

            let statusClass = '';
            let statusText = '';
            switch (guest.status) {
                case 'confirmed':
                    statusClass = 'status-confirmed';
                    statusText = 'Confirmado';
                    break;
                case 'declined':
                    statusClass = 'status-declined';
                    statusText = 'Não vai';
                    break;
                default:
                    statusClass = 'status-pending';
                    statusText = 'Pendente';
            }

            guestItem.innerHTML = `
                <div style="flex: 3;">${guest.name}</div>
                <div style="flex: 2;">${guest.email || '-'}</div>
                <div style="flex: 1;"><span class="guest-status ${statusClass}">${statusText}</span></div>
                <div style="flex: 1;">
                    <button class="action-btn edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${doc.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;

            guestListContainer.appendChild(guestItem);
        });

        // Adiciona eventos aos botões
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editGuest(e.target.closest('button').dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteGuest(e.target.closest('button').dataset.id));
        });
    });
}

// Adicionar novo convidado
addGuestBtn.addEventListener('click', () => {
    addGuestForm.style.display = 'block';
});

cancelAddBtn.addEventListener('click', () => {
    addGuestForm.style.display = 'none';
});

saveGuestBtn.addEventListener('click', async () => {
    const name = document.getElementById('newGuestName').value;
    const email = document.getElementById('newGuestEmail').value;
    const status = document.getElementById('newGuestStatus').value;

    if (!name) {
        alert('O nome é obrigatório');
        return;
    }

    try {
        await addDoc(collection(db, 'guests'), {
            name,
            nameLower: name.toLowerCase(),
            email: email || '',
            status,
            confirmedAt: status === 'confirmed' ? new Date() : null
        });

        alert('Convidado adicionado com sucesso!');
        addGuestForm.style.display = 'none';
        document.getElementById('newGuestName').value = '';
        document.getElementById('newGuestEmail').value = '';
    } catch (error) {
        alert('Erro ao adicionar convidado: ' + error.message);
    }
});

// Editar convidado
function editGuest(id) {
    const guestItem = document.querySelector(`.guest-item[data-id="${id}"]`);
    const name = guestItem.children[0].textContent;
    const email = guestItem.children[1].textContent;
    const status = guestItem.querySelector('.guest-status').textContent;

    let statusValue = 'pending';
    if (status === 'Confirmado') statusValue = 'confirmed';
    if (status === 'Não vai') statusValue = 'declined';

    guestItem.innerHTML = `
        <div style="flex: 3;"><input type="text" value="${name}" id="editName"></div>
        <div style="flex: 2;"><input type="email" value="${email === '-' ? '' : email}" id="editEmail"></div>
        <div style="flex: 1;">
            <select id="editStatus">
                <option value="pending" ${statusValue === 'pending' ? 'selected' : ''}>Pendente</option>
                <option value="confirmed" ${statusValue === 'confirmed' ? 'selected' : ''}>Confirmado</option>
                <option value="declined" ${statusValue === 'declined' ? 'selected' : ''}>Não vai</option>
            </select>
        </div>
        <div style="flex: 1;">
            <button class="action-btn save-edit-btn" data-id="${id}"><i class="fas fa-save"></i></button>
            <button class="action-btn cancel-edit-btn" data-id="${id}"><i class="fas fa-times"></i></button>
        </div>
    `;

    guestItem.querySelector('.save-edit-btn').addEventListener('click', () => saveGuestEdit(id));
    guestItem.querySelector('.cancel-edit-btn').addEventListener('click', loadGuests);
}

async function saveGuestEdit(id) {
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const status = document.getElementById('editStatus').value;

    try {
        await updateDoc(doc(db, 'guests', id), {
            name,
            nameLower: name.toLowerCase(),
            email,
            status,
            confirmedAt: status === 'confirmed' ? new Date() : null
        });

        loadGuests();
    } catch (error) {
        alert('Erro ao atualizar convidado: ' + error.message);
    }
}

// Excluir convidado
function deleteGuest(id) {
    if (confirm('Tem certeza que deseja excluir este convidado?')) {
        deleteDoc(doc(db, 'guests', id))
            .then(() => {
                alert('Convidado excluído com sucesso!');
            })
            .catch(error => {
                alert('Erro ao excluir convidado: ' + error.message);
            });
    }
}

// Exportar lista
exportBtn.addEventListener('click', async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'guests'));
        let csv = 'Nome,E-mail,Status,Data de Confirmação\n';

        querySnapshot.forEach(doc => {
            const guest = doc.data();
            const date = guest.confirmedAt ? guest.confirmedAt.toDate().toLocaleString() : '';
            csv += `"${guest.name}","${guest.email || ''}","${guest.status}","${date}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'lista_convidados.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        alert('Erro ao exportar lista: ' + error.message);
    }
});

// Verifica se o usuário está logado ao carregar a página
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Verifica se o email é o do admin
        if (user.email === ADMIN_EMAIL) {
            loginContainer.style.display = 'none';
            adminContainer.style.display = 'block';
            loadGuests();
        } else {
            // Se não for o admin, faz logout
            signOut(auth);
            alert('Acesso permitido apenas para administradores');
        }
    } else {
        loginContainer.style.display = 'block';
        adminContainer.style.display = 'none';
    }
});

// Desconectar após 30 minutos de inatividade
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        signOut(auth);
    }, 3 * 60 * 1000); // 30 minutos
}

// Reiniciar o timer em eventos de interação
window.onload = resetInactivityTimer;
window.onmousemove = resetInactivityTimer;
window.onmousedown = resetInactivityTimer;
window.ontouchstart = resetInactivityTimer;
window.onclick = resetInactivityTimer;
window.onkeypress = resetInactivityTimer;