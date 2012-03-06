
sheet = SheetProxy.get_platforms

class PlatformSheetParser < SheetParser
  @@model = Platform
  @@name = "PLATFORM"
  
  # gets each cell with index, can change attrs
  def cell_reader j, cell, attrs
    attrs[@headers[j]] = cell.cell_to_string if @headers[j] =~ /_id/ && cell.size > 0
    attrs[@headers[j]] = cell.cell_to_string if @headers[j] =~ /name/
    attrs[@headers[j]] = cell.cell_to_float if @headers[j] =~ /order/
    #puts "reading.. #{j} #{@headers[j]} #{cell}"
  end
end

PlatformSheetParser.new( sheet ).run()





