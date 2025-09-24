# Makefile for Flask Application

# Variables
PYTHON := python3
VENV_DIR := venv
PIP := $(VENV_DIR)/bin/pip
PYTHON_VENV := $(VENV_DIR)/bin/python
FLASK_APP := app.py
REQUIREMENTS := requirements.txt

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  setup     - Create virtual environment and install requirements"
	@echo "  install   - Install requirements (assumes venv exists)"
	@echo "  run       - Run the Flask application"
	@echo "  dev       - Run Flask in development mode with debug"
	@echo "  clean     - Remove virtual environment and cache files"
	@echo "  freeze    - Update requirements.txt with current packages"
	@echo "  test      - Run tests (if any)"
	@echo "  lint      - Run code linting"

# Setup virtual environment and install requirements
.PHONY: setup
setup: $(VENV_DIR)/bin/activate
	@echo "Setting up virtual environment and installing requirements..."
	$(PIP) install --upgrade pip
	$(PIP) install -r $(REQUIREMENTS)
	@echo "Setup complete! Virtual environment created and requirements installed."
	@echo "To activate the virtual environment, run: source $(VENV_DIR)/bin/activate"

# Create virtual environment
$(VENV_DIR)/bin/activate:
	@echo "Creating virtual environment..."
	$(PYTHON) -m venv $(VENV_DIR)

# Install requirements only
.PHONY: install
install:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Virtual environment not found. Please run 'make setup' first."; \
		exit 1; \
	fi
	@echo "Installing requirements..."
	$(PIP) install --upgrade pip
	$(PIP) install -r $(REQUIREMENTS)

# Run Flask application
.PHONY: run
run:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Virtual environment not found. Please run 'make setup' first."; \
		exit 1; \
	fi
	@echo "Starting Flask application..."
	$(PYTHON_VENV) $(FLASK_APP)

# Run Flask in development mode
.PHONY: dev
dev:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Virtual environment not found. Please run 'make setup' first."; \
		exit 1; \
	fi
	@echo "Starting Flask application in development mode..."
	FLASK_ENV=development FLASK_DEBUG=1 $(PYTHON_VENV) $(FLASK_APP)

# Clean up
.PHONY: clean
clean:
	@echo "Cleaning up..."
	rm -rf $(VENV_DIR)
	rm -rf __pycache__
	rm -rf *.pyc
	find . -type d -name "__pycache__" -delete
	find . -type f -name "*.pyc" -delete
	@echo "Cleanup complete!"

# Freeze requirements
.PHONY: freeze
freeze:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Virtual environment not found. Please run 'make setup' first."; \
		exit 1; \
	fi
	$(PIP) freeze > $(REQUIREMENTS)
	@echo "Requirements frozen to $(REQUIREMENTS)"

# Run tests (placeholder - add your test framework)
.PHONY: test
test:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Virtual environment not found. Please run 'make setup' first."; \
		exit 1; \
	fi
	@echo "Running tests..."
	# $(PYTHON_VENV) -m pytest tests/
	@echo "No tests configured yet."

# Lint code (placeholder - add your linting tools)
.PHONY: lint
lint:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Virtual environment not found. Please run 'make setup' first."; \
		exit 1; \
	fi
	@echo "Running linter..."
	# $(PYTHON_VENV) -m flake8 .
	# $(PYTHON_VENV) -m black --check .
	@echo "No linting configured yet."

# Force rebuild of virtual environment
.PHONY: rebuild
rebuild: clean setup
	@echo "Environment rebuilt successfully!"