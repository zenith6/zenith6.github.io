require "rubygems"
require 'rake'
require 'yaml'
require 'time'

SOURCE = "."
CONFIG = {
    version: "0.3.0",
    posts: File.join(SOURCE, "_posts"),
    post_ext: "md",
    browser: "firefox"
}

desc "Preview site"
task :preview do
    sh "start #{CONFIG[:browser]} http://localhost:4000"
    sh "jekyll server --watch"
end

desc "Create a new post in #{CONFIG[:posts]}"
task :post do
    abort("rake aborted: '#{CONFIG[:posts]}' directory not found.") unless FileTest.directory?(CONFIG[:posts])
    title = ENV["title"] || "new-post"
    tags = ENV["tags"] || "[]"
    category = ENV["category"] || ""
    category = "\"#{category.gsub(/-/,' ')}\"" if !category.empty?
    slug = title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
    begin
        date = ENV['date'] ? Time.parse(ENV["date"]) : Time.now
    rescue => e
        puts "Error - date format must be YYYY-MM-DD, please check you typed it correctly!"
        exit -1
    end
    filename = File.join(CONFIG[:posts], "#{date.strftime('%Y-%m-%d')}-#{slug}.#{CONFIG[:post_ext]}")
    if File.exist?(filename)
        abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
    end

    puts "Creating new post: #{filename}"
    open(filename, 'w') do |post|
        post.puts "---"
        post.puts "layout: post"
        post.puts "title: \"#{title.gsub(/-/,' ')}\""
        post.puts "date: #{date.strftime('%Y-%m-%d %H:%M:%S')}"
        post.puts "category: #{category}"
        post.puts "tags: #{tags}"
        post.puts "---"
    end
end
