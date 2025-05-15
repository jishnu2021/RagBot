#!/bin/bash

echo "==============================================="
echo "RAG-based Chatbot Deployment Helper"
echo "==============================================="
echo
echo "This script will help you deploy your RAG-based chatbot."
echo

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "Error: Git is not installed. Please install Git first."
    exit 1
fi

# Check if the current directory is a Git repository
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    echo "Git repository initialized."
    echo
fi

# Add all files to Git
echo "Adding files to Git..."
git add .

# Commit changes
echo "Committing changes..."
read -p "Enter a commit message: " commit_message
git commit -m "$commit_message"
echo "Changes committed."
echo

# Push to repository
echo "Would you like to push to a remote repository? (y/n)"
read push_choice

if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
    # Check if remote exists
    if ! git remote -v | grep -q "origin"; then
        echo "No remote repository found."
        read -p "Enter the URL of your remote repository: " remote_url
        git remote add origin "$remote_url"
        echo "Remote repository added."
    fi
    
    echo "Pushing to remote repository..."
    git push -u origin master || git push -u origin main
    echo "Changes pushed to remote repository."
    echo
fi

echo "==============================================="
echo "Deployment Instructions"
echo "==============================================="
echo
echo "1. Go to Render.com and sign in to your account."
echo "2. For your backend service (rag-chatbot-backend-iqiy):"
echo "   - Go to the service dashboard"
echo "   - Click 'Manual Deploy' > 'Deploy latest commit'"
echo
echo "3. For your frontend service (ragbot-q087):"
echo "   - Go to the service dashboard"
echo "   - Click 'Manual Deploy' > 'Deploy latest commit'"
echo
echo "4. Important environment variables to check on backend:"
echo "   - NODE_ENV: production"
echo "   - GEMINI_API_KEY: [your API key]"
echo "   - FRONTEND_URL: https://ragbot-q087.onrender.com"
echo
echo "5. After deployment, test at: https://ragbot-q087.onrender.com"
echo
echo "Deployment preparation complete!" 