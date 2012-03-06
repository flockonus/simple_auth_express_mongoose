
=begin
$mypass = nil

begin
  f = File.open('.password')
  $mypass = f.readline.strip
  f.close
rescue Exception => e
  puts "Password for Google Account, please:"
  $mypass = gets
end

puts ""
puts "Reaching for google docs..."
=end

# Static, able to get certain sheets
class SheetProxy
  
  @@login = 'gamewiser@gmail.com'
    
  
  @@password = 'bettergamereviewsftw' #$mypass
  @@sheet_key = '0AoFIB9JotCzrdEZqWWxNcGh6c2FKVVo0Y1ZPUzZadUE'
  @@docs = GoogleSpreadsheet.login( @@login, @@password )
  
  
  
  def self.get_genres
    return @@docs.spreadsheet_by_key( @@sheet_key ).worksheets[0]
  end
  
  def self.get_rating_labels
    return @@docs.spreadsheet_by_key( @@sheet_key ).worksheets[1]
  end
  
  def self.get_platforms
    return @@docs.spreadsheet_by_key( @@sheet_key ).worksheets[2]
  end
  
  def self.get_tags
    return @@docs.spreadsheet_by_key( @@sheet_key ).worksheets[3]
  end
  
  def self.get_games
    return @@docs.spreadsheet_by_key( @@sheet_key ).worksheets[-1]
  end
  
end

puts "  succeed!"
puts ""

class SheetParser
  
  # overide
  @@model = Class.new
  @@name = "PUT HUMAN READABLE NAME HERE"
  
  def initialize( sheet )
    @sheet = sheet
    @count = {
      :new => [],
      :error => [],
      :edit => [],
      :delete => [],
      :ignore => [],
    }
    
    @total = @sheet.rows.size
    @headers = @sheet.rows[0].select{ |x| !x.blank? }
  end
    
  def run
    puts ""
    puts "######### #{@@name}"
    
    @sheet.rows[1..-1].each_with_index do |row,i|
      # cell; ["", "", "Battlefield 3", "PC, PS3, 360", "10/25/2011", "shooter, rpg", "single player, online multiplayer, competitive multiplayer", "", "", "", "", "", "", "", "", "", "", "", "", ""]
      
      if row[0].blank? && row[2] && row[2].size >= 1 # new row
        new_row( row, i )
      elsif row[0].strip =~ /^edit$/i
        edit_row( row, i )
      elsif row[0].strip =~ /^delete$/i
        delete_row( row, i )
      else
        @count[:ignore].push 1
      end
    end
    
    finish_report()
  end
  
  protected
  
  def new_row row, i
    attrs = {}
    row.each_with_index do |cell, j|
      if( j >= 1 && @headers[j] )
        cell_reader j, cell, attrs
      end
    end
    
    #puts attrs.inspect # {"published_date"=>Tue, 25 Oct 2011, "name"=>"Battlefield 3", "platforms"=>["PC", "PS3", "360"], "tags"=>["single player", "online multiplayer", "competitive multiplayer"], "genres"=>["shooter", "rpg"]}
    m = @@model.new(attrs)
    
    #m._id = attrs['_id'] if attrs['_id']
    
    if m.save
      @count[:new].push attrs[:name]
      @sheet[i+2, 1] = "created!"
      @sheet[i+2, 2] = m._id
    else
      @count[:error].push attrs[:name]
      @sheet[i+2, 1] = "error! #{m.errors.messages.inspect}"
    end
  end
  
  def edit_row row, i
    m = ( @@model.find(row[1]) rescue nil )
    unless m
      @count[:error].push attrs[:name]
      @sheet[i+2, 1] = "error! on update _id:#{row[1]} not found"
      return nil
    end
    
    attrs = {}
    row.each_with_index do |cell, j|
      if( j >= 2 && @headers[j] )
        cell_reader j, cell, attrs
      end
    end
    
    
    if m.update_attributes( attrs )
      @count[:edit].push attrs[:name]
      @sheet[i+2, 1] = "updated!"
    else
      @count[:error].push attrs[:name]
      @sheet[i+2, 1] = "error! #{m.errors.messages.inspect}"
    end
  end
  
  def delete_row row, i
    if( row[1] && !row[1].blank? )
      m = ( @@model.find(row[1]) rescue nil )
      if m
        m.destroy
        @sheet[i+2, 1] = "deleted!"
        @count[:delete].push row[1]
      else
        @sheet[i+2, 1] = "error! on deleting _id:#{row[1]} not found"
        @count[:error].push row[1]
      end
    else
      @count[:error].push 1
    end
  end
  
  # overide
  # gets each cell with index, can change attrs
  def cell_reader j, cell, attrs
    attrs[@headers[j]] = cell.cell_to_string
  end
  
  def finish_report
    puts "  persisting sheet...#{@@name}"
    @sheet.save()
    puts "   created: #{ @count[:new].size    }"
    puts "   updated: #{ @count[:edit].size   }"
    puts "   deleted: #{ @count[:delete].size }"
    puts "   errored: #{ @count[:error].size  }"
    puts "   ignored: #{ @count[:ignore].size  }"
  end
    
end



