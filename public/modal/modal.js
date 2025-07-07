/**
 * Modal Nutricional - Gestión completa del modal de guía nutricional
 */

class ModalNutricional {
  constructor() {
    this.modal = null;
    this.form = null;
    this.isOpen = false;
    this.onSaveCallback = null;
    
    this.init();
  }

  async init() {
    try {
      // Cargar el HTML del modal
      await this.loadModalHTML();
      
      // Obtener referencias de elementos
      this.modal = document.getElementById('modal-nutricional');
      this.form = document.getElementById('form-nutricional');
      
      // Configurar event listeners
      this.setupEventListeners();
      
      console.log('✅ Modal nutricional inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar modal nutricional:', error);
    }
  }

  async loadModalHTML() {
    try {
      const response = await fetch('../modal/modal.html');
      if (!response.ok) {
        throw new Error(`Error al cargar modal: ${response.status}`);
      }
      
      const modalHTML = await response.text();
      
      // Crear contenedor si no existe
      let modalContainer = document.getElementById('modal-container');
      if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
      }
      
      modalContainer.innerHTML = modalHTML;
    } catch (error) {
      console.error('Error al cargar HTML del modal:', error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.modal || !this.form) {
      console.error('Modal o formulario no encontrados');
      return;
    }

    // Cerrar modal con X
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Cerrar modal haciendo clic fuera
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Botón cancelar
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => {
        if (confirm('¿Estás seguro de cancelar? Debes completar esta guía para continuar.')) {
          this.close();
        }
      });
    }

    // Envío del formulario
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  show(userId, nombre, onSaveCallback = null) {
    if (!this.modal) {
      console.error('Modal no inicializado');
      return;
    }

    this.userId = userId;
    this.nombre = nombre;
    this.onSaveCallback = onSaveCallback;
    
    this.modal.classList.add('active');
    this.isOpen = true;
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
    
    // Focus en el primer campo
    setTimeout(() => {
      const firstInput = this.form.querySelector('input, select, textarea');
      if (firstInput) {
        firstInput.focus();
      }
    }, 300);
  }

  close() {
    if (!this.modal) return;
    
    this.modal.classList.remove('active');
    this.isOpen = false;
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
    
    // Limpiar formulario
    this.form.reset();
    this.clearValidationErrors();
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Estado de carga
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Guardando...';

    try {
      // Validar formulario
      if (!this.validateForm()) {
        return;
      }

      const formData = new FormData(this.form);
      const peso = parseFloat(formData.get('peso'));
      const estatura = parseFloat(formData.get('estatura'));

      // Validaciones adicionales
      if (isNaN(peso) || peso < 30 || peso > 300) {
        this.showFieldError('peso', 'Peso inválido (30 - 300 kg)');
        return;
      }

      if (isNaN(estatura) || estatura < 1.0 || estatura > 2.5) {
        this.showFieldError('estatura', 'Estatura inválida (1.0 - 2.5 m)');
        return;
      }

      // Crear objeto de guía
      const nuevaGuia = {
        IdUsuario: this.userId,
        Objetivo: formData.get('objetivo').trim(),
        Alergias: formData.get('alergias').trim(),
        PesoActual: peso,
        Estatura: estatura,
        NivelActividad: formData.get('actividad').trim(),
        CondicionesMedicas: formData.get('condiciones').trim()
      };

      // Enviar a la API
      const response = await fetch('https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/GuiaNutricionals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(nuevaGuia)
      });

      if (response.ok) {
        const resultado = await response.json();
        console.log('Guía guardada exitosamente:', resultado);

        // Asignar comidas si no es plan Básico
        await this.asignarComidasSiEsNecesario(resultado);

        // Cerrar modal
        this.close();
        
        // Mostrar mensaje de éxito
        this.showSuccessMessage();

        // Ejecutar callback si existe
        if (this.onSaveCallback && typeof this.onSaveCallback === 'function') {
          this.onSaveCallback(resultado);
        }

      } else {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        this.showError(`Error al guardar la guía: ${response.status}`);
      }

    } catch (error) {
      console.error('Error al enviar guía:', error);
      this.showError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      // Restaurar botón
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.textContent = originalText;
    }
  }

  async asignarComidasSiEsNecesario(guia) {
    try {
      // Verificar tipo de membresía
      const membresias = await fetch('https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/Membresias').then(r => r.json());
      const miembro = membresias.find(m => m.idUsuario === this.userId);
      const tipoMembresia = miembro?.tipoMembresia?.nombre;

      // Solo asignar comidas si no es plan Básico
      if (tipoMembresia !== 'Básico') {
        await this.asignarComidasDesdeJSON(
          guia.idGuia,
          guia.objetivo,
          guia.alergias,
          guia.nivelActividad
        );
      }
    } catch (error) {
      console.error('Error al asignar comidas:', error);
    }
  }

  async asignarComidasDesdeJSON(idGuia, objetivo, alergias, actividad) {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const tipos = ['desayuno', 'almuerzo', 'merienda'];

    try {
      // Validar si ya existen comidas para esta guía
      const existentes = await fetch('https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/ComidaNutricionales').then(r => r.json());
      const duplicadas = existentes.filter(c => c.idGuia === idGuia);
      if (duplicadas.length > 0) {
        console.log('Ya existen comidas para esta guía, no se duplicarán.');
        return;
      }

      const data = await fetch('../data/comida-nutricional.json').then(r => r.json());
      
      // Sistema de fallback para encontrar comidas
      let comidas = null;
      
      if (data.comidas?.[objetivo]?.[alergias]?.[actividad]) {
        comidas = data.comidas[objetivo][alergias][actividad];
        console.log('✅ Encontrado: combinación exacta');
      } 
      else if (data.comidas?.[objetivo]?.['Ninguna']?.[actividad]) {
        comidas = data.comidas[objetivo]['Ninguna'][actividad];
        console.log('⚠️ Fallback: usando "Ninguna" alergia para', objetivo, actividad);
      }
      else if (data.comidas?.[objetivo]?.[alergias]?.['Sedentario']) {
        comidas = data.comidas[objetivo][alergias]['Sedentario'];
        console.log('⚠️ Fallback: usando "Sedentario" para', objetivo, alergias);
      }
      else if (data.comidas?.['Ganar masa muscular']?.['Ninguna']?.['Sedentario']) {
        comidas = data.comidas['Ganar masa muscular']['Ninguna']['Sedentario'];
        console.log('⚠️ Fallback final: configuración básica');
      }

      if (!comidas) {
        console.warn('No se encontraron comidas para ninguna combinación');
        return;
      }

      // Asignar comidas
      for (const tipo of tipos) {
        for (const dia of dias) {
          const comida = comidas[tipo].find(c => c.dia === dia);
          if (!comida) continue;

          const nuevaComida = {
            idGuia: idGuia,
            diaSemana: dia,
            tipoComida: tipo,
            descripcion: comida.descripcion,
            calorias: comida.calorias,
            proteinas: comida.proteinas,
            carbohidratos: comida.carbohidratos,
            grasas: comida.grasas
          };

          await fetch('https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/ComidaNutricionales', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(nuevaComida)
          });
        }
      }
      console.log('Comidas asignadas correctamente');

    } catch (error) {
      console.error('Error asignando comidas:', error);
    }
  }

  validateForm() {
    this.clearValidationErrors();
    let isValid = true;

    // Validar campos requeridos
    const requiredFields = ['objetivo', 'alergias', 'peso', 'estatura', 'actividad', 'condiciones', 'motivacion'];
    
    requiredFields.forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field || !field.value.trim()) {
        this.showFieldError(fieldName, 'Este campo es obligatorio');
        isValid = false;
      }
    });

    return isValid;
  }

  showFieldError(fieldName, message) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    const formGroup = field.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('error');
      
      // Agregar mensaje de error si no existe
      let errorMessage = formGroup.querySelector('.error-message');
      if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        formGroup.appendChild(errorMessage);
      }
      errorMessage.textContent = message;
    }
  }

  clearValidationErrors() {
    const errorGroups = this.form.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => {
      group.classList.remove('error');
      const errorMessage = group.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.style.display = 'none';
      }
    });
  }

  showSuccessMessage() {
    // Crear y mostrar mensaje de éxito
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      z-index: 1001;
      font-weight: 600;
      animation: slideInRight 0.5s ease-out;
    `;
    successDiv.innerHTML = '✅ ¡Tu guía ha sido guardada exitosamente!';
    
    document.body.appendChild(successDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      successDiv.style.animation = 'slideOutRight 0.5s ease-in';
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.parentNode.removeChild(successDiv);
        }
      }, 500);
    }, 3000);
  }

  showError(message) {
    // Crear y mostrar mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
      z-index: 1001;
      font-weight: 600;
      animation: slideInRight 0.5s ease-out;
    `;
    errorDiv.innerHTML = `❌ ${message}`;
    
    document.body.appendChild(errorDiv);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      errorDiv.style.animation = 'slideOutRight 0.5s ease-in';
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 500);
    }, 5000);
  }
}

// Crear instancia global del modal
let modalNutricional = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    modalNutricional = new ModalNutricional();
  } catch (error) {
    console.error('Error al inicializar modal nutricional:', error);
  }
});

// Función global para mostrar el modal (para compatibilidad)
function mostrarModalNutricional(userId, nombre, onSaveCallback = null) {
  if (modalNutricional) {
    modalNutricional.show(userId, nombre, onSaveCallback);
  } else {
    console.error('Modal nutricional no inicializado');
  }
}