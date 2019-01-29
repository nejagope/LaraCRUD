<?php

namespace App\Http\Controllers\%RoutePrefixCapitalized%;

use App\Http\Controllers\Controller;
use App\%ModelName%;
use Illuminate\Http\Request;

class %RoutePrefixCapitalized%%ModelPluralName%Controller extends Controller
{
    public function index(Request $request){
		$%Table% = %ModelName%::withTrashed()->paginate(15);
		return view('%RoutePrefix%.%Table%.index', ['%Table%' => $%Table%]);
	}
	
	public function create(Request $request){
		return view('%RoutePrefix%.%Table%.create');
	}
	
	public function store(Request $request){
		$this->validate(
			$request, 
			[
				%ValidationRules%            
			]
		);
		
		$%TableSingularName% = new %ModelName%;
		
		%FieldsAsignation%

		$%TableSingularName%->save();
		return redirect()->route('%RoutePrefix%_%Table%_index');
	}
	
	public function edit(Request $request){
		$%TableSingularName% = %ModelName%::findOrFail($request->%TableSingularName%);
		return view('%RoutePrefix%.%Table%.edit', ['%TableSingularName%' => $%TableSingularName%]);
	}
	
	public function update(Request $request){		
		$this->validate(
			$request, 
			[
				%ValidationRules%
			]
		);

		$%TableSingularName% = %ModelName%::findOrFail($request->%TableSingularName%);	
		
		%FieldsAsignation%
		
		$%TableSingularName%->save();
		return redirect()->route('%RoutePrefix%_%Table%_index');
	}
	
	public function delete(Request $request){		
		$%TableSingularName% = %ModelName%::findOrFail($request->%TableSingularName%);	
		$%TableSingularName%->delete();
		return redirect()->route('%RoutePrefix%_%Table%_index');
	}

	public function remove(Request $request){		
		$%TableSingularName% = %ModelName%::withTrashed()->findOrFail($request->%TableSingularName%);	
		$%TableSingularName%->forceDelete();
		return redirect()->route('%RoutePrefix%_%Table%_index');
	}

	public function restore(Request $request){	
		$%TableSingularName% = %ModelName%::withTrashed()->findOrFail($request->%TableSingularName%);		
		$%TableSingularName%->restore();
		return redirect()->route('%RoutePrefix%_%Table%_index');
	}
}
